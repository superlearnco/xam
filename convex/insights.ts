import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

function normalizeStudentName(name: string | null | undefined): string | null {
  if (!name) return null;
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split("T")[0];
}

type SubmissionWithTest = {
  testId: Id<"tests">;
  testName: string;
  respondentName: string | null | undefined;
  respondentEmail: string | null | undefined;
  score: number | null | undefined;
  maxScore: number | null | undefined;
  percentage: number | null | undefined;
  submittedAt: number;
  startedAt: number;
  isMarked: boolean;
};

async function getAllTestsAndSubmissionsForUser(ctx: any, userId: string) {
  const tests = await ctx.db
    .query("tests")
    .withIndex("userId", (q: any) => q.eq("userId", userId))
    .collect();

  if (tests.length === 0) {
    return { tests, submissions: [] as SubmissionWithTest[] };
  }

  const submissions: SubmissionWithTest[] = [];

  for (const test of tests) {
    const testSubmissions = await ctx.db
      .query("testSubmissions")
      .withIndex("testId", (q: any) => q.eq("testId", test._id))
      .collect();

    for (const s of testSubmissions) {
      submissions.push({
        testId: test._id,
        testName: test.name,
        respondentName: s.respondentName,
        respondentEmail: s.respondentEmail,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        submittedAt: s.submittedAt,
        startedAt: s.startedAt,
        isMarked: s.isMarked ?? false,
      });
    }
  }

  return { tests, submissions };
}

export const getOverallInsights = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { tests, submissions } = await getAllTestsAndSubmissionsForUser(
      ctx,
      identity.subject
    );

    if (tests.length === 0 || submissions.length === 0) {
      return null;
    }

    const totalTests = tests.length;
    const testsWithSubmissions = new Set<Id<"tests">>();
    const studentNames = new Set<string>();

    let totalMarkedPercentageSum = 0;
    let totalMarkedCount = 0;

    const perTestMap = new Map<
      Id<"tests">,
      {
        testId: Id<"tests">;
        testName: string;
        submissions: number;
        markedSubmissions: number;
        percentageSum: number;
        percentageCount: number;
        lastSubmittedAt: number;
      }
    >();

    let lastSubmissionAt = 0;
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    let submissionsLast7Days = 0;

    for (const s of submissions) {
      const testId = s.testId;
      testsWithSubmissions.add(testId);

      const normalizedName = normalizeStudentName(s.respondentName ?? undefined);
      if (normalizedName) {
        studentNames.add(normalizedName);
      }

      if (s.isMarked && s.percentage != null) {
        totalMarkedPercentageSum += s.percentage;
        totalMarkedCount += 1;
      }

      let testSummary = perTestMap.get(testId);
      if (!testSummary) {
        testSummary = {
          testId,
          testName: s.testName,
          submissions: 0,
          markedSubmissions: 0,
          percentageSum: 0,
          percentageCount: 0,
          lastSubmittedAt: s.submittedAt,
        };
        perTestMap.set(testId, testSummary);
      }

      testSummary.submissions += 1;
      if (s.isMarked) {
        testSummary.markedSubmissions += 1;
      }
      if (s.percentage != null) {
        testSummary.percentageSum += s.percentage;
        testSummary.percentageCount += 1;
      }
      if (s.submittedAt > testSummary.lastSubmittedAt) {
        testSummary.lastSubmittedAt = s.submittedAt;
      }

      if (s.submittedAt > lastSubmissionAt) {
        lastSubmissionAt = s.submittedAt;
      }
      if (s.submittedAt >= sevenDaysAgo) {
        submissionsLast7Days += 1;
      }
    }

    const averageMarkedPercentage =
      totalMarkedCount > 0
        ? Math.round(totalMarkedPercentageSum / totalMarkedCount)
        : null;

    const perTest = Array.from(perTestMap.values()).map((t) => ({
      ...t,
      averagePercentage:
        t.percentageCount > 0
          ? Math.round(t.percentageSum / t.percentageCount)
          : null,
    }));

    const mostAttemptedTests = [...perTest]
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5);

    const topTestsByAverage = [...perTest]
      .filter((t) => t.averagePercentage != null)
      .sort((a, b) => (b.averagePercentage ?? 0) - (a.averagePercentage ?? 0))
      .slice(0, 5);

    // Generate submission trend data (last 30 days)
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const submissionsByDate = new Map<string, { submissions: number; avgPercentage: number; percentageSum: number; percentageCount: number }>();
    
    // Initialize all dates in the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateKey = getDateKey(date.getTime());
      submissionsByDate.set(dateKey, { submissions: 0, avgPercentage: 0, percentageSum: 0, percentageCount: 0 });
    }
    
    // Populate with actual data
    for (const s of submissions) {
      if (s.submittedAt >= thirtyDaysAgo) {
        const dateKey = getDateKey(s.submittedAt);
        const existing = submissionsByDate.get(dateKey);
        if (existing) {
          existing.submissions += 1;
          if (s.isMarked && s.percentage != null) {
            existing.percentageSum += s.percentage;
            existing.percentageCount += 1;
          }
        }
      }
    }
    
    // Calculate averages and format for chart
    const submissionTrend = Array.from(submissionsByDate.entries())
      .map(([date, data]) => ({
        date,
        submissions: data.submissions,
        avgPercentage: data.percentageCount > 0 ? Math.round(data.percentageSum / data.percentageCount) : null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Score distribution for pie chart
    const scoreDistribution = {
      excellent: 0, // 90-100%
      good: 0, // 70-89%
      average: 0, // 50-69%
      needsImprovement: 0, // below 50%
    };

    for (const s of submissions) {
      if (s.isMarked && s.percentage != null) {
        if (s.percentage >= 90) scoreDistribution.excellent++;
        else if (s.percentage >= 70) scoreDistribution.good++;
        else if (s.percentage >= 50) scoreDistribution.average++;
        else scoreDistribution.needsImprovement++;
      }
    }

    return {
      summary: {
        totalTests,
        testsWithSubmissions: testsWithSubmissions.size,
        totalSubmissions: submissions.length,
        uniqueStudents: studentNames.size,
        averageMarkedPercentage,
        lastSubmissionAt,
        submissionsLast7Days,
        markedSubmissions: totalMarkedCount,
      },
      perTest,
      mostAttemptedTests,
      topTestsByAverage,
      submissionTrend,
      scoreDistribution,
    };
  },
});

export const listStudentsInsights = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { submissions } = await getAllTestsAndSubmissionsForUser(
      ctx,
      identity.subject
    );

    if (submissions.length === 0) {
      return {
        totalStudents: 0,
        totalAttempts: 0,
        students: [] as any[],
      };
    }

    type StudentSummary = {
      normalizedName: string;
      nameVariants: Set<string>;
      attempts: number;
      markedAttempts: number;
      percentageSum: number;
      percentageCount: number;
      firstAttemptAt: number;
      lastAttemptAt: number;
    };

    const studentsMap = new Map<string, StudentSummary>();

    for (const s of submissions) {
      const normalized = normalizeStudentName(s.respondentName ?? undefined);
      if (!normalized) continue;

      let summary = studentsMap.get(normalized);
      if (!summary) {
        summary = {
          normalizedName: normalized,
          nameVariants: new Set<string>(),
          attempts: 0,
          markedAttempts: 0,
          percentageSum: 0,
          percentageCount: 0,
          firstAttemptAt: s.submittedAt,
          lastAttemptAt: s.submittedAt,
        };
        studentsMap.set(normalized, summary);
      }

      if (s.respondentName && s.respondentName.trim().length > 0) {
        summary.nameVariants.add(s.respondentName);
      }

      summary.attempts += 1;
      if (s.isMarked) {
        summary.markedAttempts += 1;
      }
      if (s.percentage != null) {
        summary.percentageSum += s.percentage;
        summary.percentageCount += 1;
      }
      if (s.submittedAt < summary.firstAttemptAt) {
        summary.firstAttemptAt = s.submittedAt;
      }
      if (s.submittedAt > summary.lastAttemptAt) {
        summary.lastAttemptAt = s.submittedAt;
      }
    }

    const students = Array.from(studentsMap.values())
      .map((s) => ({
        normalizedName: s.normalizedName,
        nameVariants: Array.from(s.nameVariants),
        attempts: s.attempts,
        markedAttempts: s.markedAttempts,
        averagePercentage:
          s.percentageCount > 0
            ? Math.round(s.percentageSum / s.percentageCount)
            : null,
        firstAttemptAt: s.firstAttemptAt,
        lastAttemptAt: s.lastAttemptAt,
      }))
      .sort((a, b) => b.lastAttemptAt - a.lastAttemptAt);

    const totalStudents = students.length;
    const totalAttempts = submissions.length;

    return {
      totalStudents,
      totalAttempts,
      students,
    };
  },
});

export const getStudentInsights = query({
  args: {
    studentName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const normalizedTarget = normalizeStudentName(args.studentName);
    if (!normalizedTarget) {
      return null;
    }

    const { tests, submissions } = await getAllTestsAndSubmissionsForUser(
      ctx,
      identity.subject
    );

    if (tests.length === 0 || submissions.length === 0) {
      return null;
    }

    const testsById = new Map<Id<"tests">, (typeof tests)[number]>(
      tests.map(
        (t: (typeof tests)[number]) =>
          [t._id, t] as [Id<"tests">, (typeof tests)[number]]
      )
    );

    const submissionsForStudent: Array<{
      _id: Id<"testSubmissions">;
      testId: Id<"tests">;
      respondentName: string | null | undefined;
      respondentEmail: string | null | undefined;
      score: number | null | undefined;
      maxScore: number | null | undefined;
      percentage: number | null | undefined;
      submittedAt: number;
      startedAt: number;
      isMarked: boolean;
    }> = [];

    const nameVariants = new Set<string>();

    for (const s of submissions) {
      const normalized = normalizeStudentName(s.respondentName ?? undefined);
      if (!normalized || normalized !== normalizedTarget) continue;

      nameVariants.add(s.respondentName ?? "");

      submissionsForStudent.push({
        _id: s.testId as unknown as Id<"testSubmissions">, // placeholder, not used on client
        testId: s.testId,
        respondentName: s.respondentName,
        respondentEmail: s.respondentEmail,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        submittedAt: s.submittedAt,
        startedAt: s.startedAt,
        isMarked: s.isMarked,
      });
    }

    if (submissionsForStudent.length === 0) {
      return null;
    }

    submissionsForStudent.sort((a, b) => a.submittedAt - b.submittedAt);

    type TestSummary = {
      testId: Id<"tests">;
      testName: string;
      attempts: number;
      markedAttempts: number;
      averageScore: number | null;
      averagePercentage: number | null;
      latestPercentage: number | null;
      firstAttemptAt: number;
      lastAttemptAt: number;
    };

    const perTestMap = new Map<Id<"tests">, TestSummary>();

    let totalScore = 0;
    let totalMaxScore = 0;
    let totalPercentageSum = 0;
    let totalPercentageCount = 0;

    const history = submissionsForStudent.map((s) => {
      const test = testsById.get(s.testId);
      const testName = test?.name ?? "Untitled test";

      let summary = perTestMap.get(s.testId);
      if (!summary) {
        summary = {
          testId: s.testId,
          testName,
          attempts: 0,
          markedAttempts: 0,
          averageScore: null,
          averagePercentage: null,
          latestPercentage: null,
          firstAttemptAt: s.submittedAt,
          lastAttemptAt: s.submittedAt,
        };
        perTestMap.set(s.testId, summary);
      }

      summary.attempts += 1;
      summary.lastAttemptAt = s.submittedAt;
      summary.firstAttemptAt = Math.min(summary.firstAttemptAt, s.submittedAt);

      if (s.isMarked && s.score != null && s.maxScore != null) {
        summary.markedAttempts += 1;
        totalScore += s.score;
        totalMaxScore += s.maxScore;
      }

      if (s.percentage != null) {
        totalPercentageSum += s.percentage;
        totalPercentageCount += 1;
        summary.latestPercentage = s.percentage;
      }

      return {
        submissionId: s._id,
        testId: s.testId,
        testName,
        submittedAt: s.submittedAt,
        startedAt: s.startedAt,
        score: s.score,
        maxScore: s.maxScore,
        percentage: s.percentage,
        isMarked: s.isMarked,
      };
    });

    for (const summary of perTestMap.values()) {
      if (summary.markedAttempts > 0) {
        const testSubmissions = submissionsForStudent.filter(
          (s) =>
            s.testId === summary.testId &&
            s.isMarked &&
            s.score != null &&
            s.maxScore != null
        );
        const scoreSum = testSubmissions.reduce(
          (acc, s) => acc + (s.score ?? 0),
          0
        );
        const maxScoreSum = testSubmissions.reduce(
          (acc, s) => acc + (s.maxScore ?? 0),
          0
        );
        summary.averageScore =
          maxScoreSum > 0 ? scoreSum / testSubmissions.length : null;
        summary.averagePercentage =
          testSubmissions.length > 0
            ? Math.round(
                testSubmissions.reduce(
                  (acc, s) => acc + (s.percentage ?? 0),
                  0
                ) / testSubmissions.length
              )
            : null;
      }
    }

    const overallAveragePercentage =
      totalPercentageCount > 0
        ? Math.round(totalPercentageSum / totalPercentageCount)
        : null;

    const overallAverageScore =
      totalMaxScore > 0 ? totalScore / (totalMaxScore / 100) : null;

    // Performance trend over time (for line chart)
    const performanceTrend = submissionsForStudent
      .filter((s) => s.isMarked && s.percentage != null)
      .map((s) => ({
        date: getDateKey(s.submittedAt),
        percentage: s.percentage!,
        testName: testsById.get(s.testId)?.name ?? "Untitled",
      }));

    // Score distribution for this student
    const studentScoreDistribution = {
      excellent: 0, // 90-100%
      good: 0, // 70-89%
      average: 0, // 50-69%
      needsImprovement: 0, // below 50%
    };

    for (const s of submissionsForStudent) {
      if (s.isMarked && s.percentage != null) {
        if (s.percentage >= 90) studentScoreDistribution.excellent++;
        else if (s.percentage >= 70) studentScoreDistribution.good++;
        else if (s.percentage >= 50) studentScoreDistribution.average++;
        else studentScoreDistribution.needsImprovement++;
      }
    }

    // Performance by test (for bar chart)
    const testPerformance = Array.from(perTestMap.values())
      .filter((t) => t.averagePercentage != null)
      .map((t) => ({
        testId: t.testId,
        testName: t.testName.length > 20 ? t.testName.substring(0, 20) + "..." : t.testName,
        fullTestName: t.testName,
        averagePercentage: t.averagePercentage!,
        attempts: t.attempts,
      }))
      .sort((a, b) => b.averagePercentage - a.averagePercentage);

    // Calculate improvement trend
    const markedSubmissions = submissionsForStudent.filter(
      (s) => s.isMarked && s.percentage != null
    );
    
    let improvementTrend: "improving" | "declining" | "stable" | "insufficient_data" = "insufficient_data";
    
    if (markedSubmissions.length >= 3) {
      const recentHalf = markedSubmissions.slice(-Math.ceil(markedSubmissions.length / 2));
      const olderHalf = markedSubmissions.slice(0, Math.floor(markedSubmissions.length / 2));
      
      const recentAvg = recentHalf.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / olderHalf.length;
      
      const diff = recentAvg - olderAvg;
      if (diff > 5) improvementTrend = "improving";
      else if (diff < -5) improvementTrend = "declining";
      else improvementTrend = "stable";
    }

    // Best and worst performing tests
    const sortedByPerformance = Array.from(perTestMap.values())
      .filter((t) => t.averagePercentage != null);
    
    const bestTest = sortedByPerformance.length > 0
      ? sortedByPerformance.reduce((best, curr) => 
          (curr.averagePercentage ?? 0) > (best.averagePercentage ?? 0) ? curr : best
        )
      : null;
    
    const worstTest = sortedByPerformance.length > 0
      ? sortedByPerformance.reduce((worst, curr) => 
          (curr.averagePercentage ?? 0) < (worst.averagePercentage ?? 0) ? curr : worst
        )
      : null;

    return {
      student: {
        normalizedName: normalizedTarget,
        nameVariants: Array.from(nameVariants).filter(
          (n) => n.trim().length > 0
        ),
      },
      overall: {
        attempts: submissionsForStudent.length,
        markedAttempts: markedSubmissions.length,
        averagePercentage: overallAveragePercentage,
        averageScore: overallAverageScore,
        firstAttemptAt: submissionsForStudent[0].submittedAt,
        lastAttemptAt:
          submissionsForStudent[submissionsForStudent.length - 1].submittedAt,
        improvementTrend,
        bestTest: bestTest ? { name: bestTest.testName, percentage: bestTest.averagePercentage } : null,
        worstTest: worstTest ? { name: worstTest.testName, percentage: worstTest.averagePercentage } : null,
      },
      perTest: Array.from(perTestMap.values()),
      history,
      performanceTrend,
      scoreDistribution: studentScoreDistribution,
      testPerformance,
    };
  },
});


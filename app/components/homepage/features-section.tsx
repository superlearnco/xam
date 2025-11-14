"use client";
import { motion } from "motion/react";
import {
  Sparkles,
  CheckCircle,
  Layout,
  BarChart3,
  Share2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI Question Generation",
    description: "Generate diverse questions from any topic",
    benefit: "Save hours of prep time",
  },
  {
    icon: CheckCircle,
    title: "Smart Auto-Grading",
    description: "AI marks text responses with context",
    benefit: "Instant feedback for students",
  },
  {
    icon: Layout,
    title: "Drag-and-Drop Builder",
    description: "Build forms visually",
    benefit: "No technical skills required",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track class performance",
    benefit: "Data-driven insights",
  },
  {
    icon: Share2,
    title: "Flexible Distribution",
    description: "Password protection, time limits",
    benefit: "Secure test delivery",
  },
  {
    icon: FileText,
    title: "Survey Mode",
    description: "Collect feedback and data",
    benefit: "Versatile tool for all needs",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Create Better Tests
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make test creation and grading effortless
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2">
                  <CardHeader>
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {feature.benefit}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


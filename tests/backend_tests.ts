
/**
 * Test Plan for Backend Optimization
 * 
 * Note: To run these tests, you would need to set up convex-test and vitest.
 * 
 * describe('Convex Tests Backend Optimization', () => {
 *   test('listTests should use correct indexes for sorting', async () => {
 *     // 1. Setup: Create a user and multiple tests with different names, creation times, and last edited times.
 *     //    - Test A: created 10:00, edited 10:00, name "A"
 *     //    - Test B: created 09:00, edited 11:00, name "B"
 *     //    - Test C: created 11:00, edited 09:00, name "C"
 *     
 *     // 2. Verify "recency" sort (default desc by creation time):
 *     //    - Call listTests({ sortBy: "recency" })
 *     //    - Expect order: C, A, B
 *     
 *     // 3. Verify "lastEdited" sort (desc by lastEdited):
 *     //    - Call listTests({ sortBy: "lastEdited" })
 *     //    - Expect order: B, A, C
 *     
 *     // 4. Verify "name" sort (asc by name):
 *     //    - Call listTests({ sortBy: "name" })
 *     //    - Expect order: A, B, C
 *     
 *     // 5. Verify filtering still works:
 *     //    - Call listTests({ sortBy: "name", search: "A" })
 *     //    - Expect result: [Test A]
 *   });
 *
 *   test('listTests should fallback to userId index (default) if no sort provided', async () => {
 *     // 1. Call listTests({})
 *     // 2. Verify results are returned (order undefined but consistent)
 *   });
 * });
 */

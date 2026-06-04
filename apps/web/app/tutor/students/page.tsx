import Link from "next/link";
import { db } from "@repo/db/client";
import { skillGroup } from "@repo/db/schema";
import { eq } from "@repo/db/drizzle";
import { requireAuth } from "~/lib/auth/session";
import { getTutorStudents } from "~/lib/tutor/scope";

type SearchParams = Promise<{
  q?: string;
}>;

export default async function TutorStudentsPage(props: {
  searchParams: SearchParams;
}) {
  const authUser = await requireAuth();
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const allStudents = await getTutorStudents(authUser.id);

  let filteredStudents = allStudents;
  if (query) {
    filteredStudents = allStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(query.toLowerCase()) ||
        s.email?.toLowerCase().includes(query.toLowerCase())
    );
  }

  const studentDetails = await Promise.all(
    filteredStudents.map(async (student) => {
      const group = student.skillGroupId
        ? await db.query.skillGroup.findFirst({
            where: eq(skillGroup.id, student.skillGroupId),
          })
        : null;

      return {
        ...student,
        skillGroupName: group?.name || "Unassigned",
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-sm text-muted-foreground">
          {studentDetails.length} student{studentDetails.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      <div>
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or email..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                Skill Group
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {studentDetails.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  {query
                    ? "No students found matching your search"
                    : "No students assigned to your skill groups yet"}
                </td>
              </tr>
            ) : (
              studentDetails.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {student.name || "—"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {student.skillGroupName}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/tutor/students/${student.id}`}
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

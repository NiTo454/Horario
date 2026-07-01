import { getActiveSemester, getSemesters } from "./actions/schedule";
import StudentScheduleView from "@/components/StudentScheduleView";

export const revalidate = 0; // Disable cache to fetch fresh database results

export default async function Home() {
  const semesters = await getSemesters();
  const activeSemester = await getActiveSemester();

  // Serialize Prisma Date objects to string to prevent RSC serialization warnings
  const serializedSemesters = semesters.map(sem => ({
    ...sem,
    createdAt: sem.createdAt.toISOString(),
    updatedAt: sem.updatedAt.toISOString(),
    subjects: sem.subjects.map(sub => ({
      ...sub,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
      slots: sub.slots.map(slot => ({ ...slot }))
    }))
  }));

  const serializedActive = activeSemester ? {
    ...activeSemester,
    createdAt: activeSemester.createdAt.toISOString(),
    updatedAt: activeSemester.updatedAt.toISOString(),
    subjects: activeSemester.subjects.map(sub => ({
      ...sub,
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
      slots: sub.slots.map(slot => ({ ...slot }))
    }))
  } : null;

  return (
    <StudentScheduleView 
      semesters={serializedSemesters as any} 
      activeSemester={serializedActive as any} 
    />
  );
}

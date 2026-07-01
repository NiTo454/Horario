import { getActiveSemester, getSemesters } from "./actions/schedule";
import StudentScheduleView from "@/components/StudentScheduleView";

export const revalidate = 0; // Disable cache to fetch fresh database results

export default async function Home() {
  const semesters = await getSemesters();
  const activeSemester = await getActiveSemester();

  // Serialize Prisma Date objects to string to prevent RSC serialization warnings
  const serializedSemesters = (semesters as any[]).map((sem: any) => ({
    ...sem,
    createdAt: sem.createdAt.toISOString ? sem.createdAt.toISOString() : sem.createdAt,
    updatedAt: sem.updatedAt.toISOString ? sem.updatedAt.toISOString() : sem.updatedAt,
    subjects: (sem.subjects || []).map((sub: any) => ({
      ...sub,
      createdAt: sub.createdAt.toISOString ? sub.createdAt.toISOString() : sub.createdAt,
      updatedAt: sub.updatedAt.toISOString ? sub.updatedAt.toISOString() : sub.updatedAt,
      slots: (sub.slots || []).map((slot: any) => ({ ...slot }))
    }))
  }));

  const serializedActive = activeSemester ? {
    ...activeSemester,
    createdAt: (activeSemester as any).createdAt.toISOString ? (activeSemester as any).createdAt.toISOString() : (activeSemester as any).createdAt,
    updatedAt: (activeSemester as any).updatedAt.toISOString ? (activeSemester as any).updatedAt.toISOString() : (activeSemester as any).updatedAt,
    subjects: ((activeSemester as any).subjects || []).map((sub: any) => ({
      ...sub,
      createdAt: sub.createdAt.toISOString ? sub.createdAt.toISOString() : sub.createdAt,
      updatedAt: sub.updatedAt.toISOString ? sub.updatedAt.toISOString() : sub.updatedAt,
      slots: (sub.slots || []).map((slot: any) => ({ ...slot }))
    }))
  } : null;

  return (
    <StudentScheduleView 
      semesters={serializedSemesters as any} 
      activeSemester={serializedActive as any} 
    />
  );
}

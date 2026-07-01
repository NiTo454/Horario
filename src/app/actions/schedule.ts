'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSemesters() {
  try {
    return await prisma.semester.findMany({
      include: {
        subjects: {
          include: {
            slots: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return [];
  }
}

export async function getActiveSemester() {
  try {
    const active = await prisma.semester.findFirst({
      where: { isActive: true },
      include: {
        subjects: {
          include: {
            slots: true,
          },
        },
      },
    });
    
    if (active) return active;
    
    // Fallback to the first created semester if none is active
    return await prisma.semester.findFirst({
      include: {
        subjects: {
          include: {
            slots: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching active semester:", error);
    return null;
  }
}

export async function createSemester(name: string, isActive: boolean) {
  try {
    if (isActive) {
      // Deactivate all others
      await prisma.semester.updateMany({
        data: { isActive: false },
      });
    }
    
    const newSemester = await prisma.semester.create({
      data: {
        name,
        isActive,
      },
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, semester: newSemester };
  } catch (error) {
    console.error("Error creating semester:", error);
    return { success: false, error: "Error al crear el semestre" };
  }
}

export async function updateSemester(id: string, name: string, isActive: boolean) {
  try {
    if (isActive) {
      // Deactivate all others
      await prisma.semester.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }
    
    const updated = await prisma.semester.update({
      where: { id },
      data: {
        name,
        isActive,
      },
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, semester: updated };
  } catch (error) {
    console.error("Error updating semester:", error);
    return { success: false, error: "Error al actualizar el semestre" };
  }
}

export async function deleteSemester(id: string) {
  try {
    await prisma.semester.delete({
      where: { id },
    });
    
    // Check if there are other semesters left and none is active, set one as active
    const active = await prisma.semester.findFirst({
      where: { isActive: true },
    });
    if (!active) {
      const first = await prisma.semester.findFirst({
        orderBy: { createdAt: "asc" },
      });
      if (first) {
        await prisma.semester.update({
          where: { id: first.id },
          data: { isActive: true },
        });
      }
    }
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting semester:", error);
    return { success: false, error: "Error al eliminar el semestre" };
  }
}

export async function createSubject(data: {
  name: string;
  teacher?: string;
  classroom?: string;
  color: string;
  semesterId: string;
  slots: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  try {
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        teacher: data.teacher || null,
        classroom: data.classroom || null,
        color: data.color,
        semesterId: data.semesterId,
        slots: {
          create: data.slots.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      include: {
        slots: true,
      },
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, subject };
  } catch (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: "Error al crear la materia" };
  }
}

export async function updateSubject(
  id: string,
  data: {
    name: string;
    teacher?: string;
    classroom?: string;
    color: string;
    slots: { dayOfWeek: number; startTime: string; endTime: string }[];
  }
) {
  try {
    // Delete existing slots
    await prisma.scheduleSlot.deleteMany({
      where: { subjectId: id },
    });
    
    // Update subject and create new slots
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        name: data.name,
        teacher: data.teacher || null,
        classroom: data.classroom || null,
        color: data.color,
        slots: {
          create: data.slots.map(slot => ({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      include: {
        slots: true,
      },
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, subject };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: "Error al actualizar la materia" };
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({
      where: { id },
    });
    
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: "Error al eliminar la materia" };
  }
}

export async function verifyAdminPassword(password: string) {
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";
  if (password === adminPass) {
    return { success: true };
  }
  return { success: false };
}


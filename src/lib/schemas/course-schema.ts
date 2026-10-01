import { z } from "zod";

import type { Course } from "@/lib/types";

export const courseFormSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),

  courseTitle: z
    .string()
    .trim()
    .min(1, "กรอกชื่อวิชา")
    .max(100, "ชื่อวิชายาวไม่เกิน 100 ตัวอักษร"),

  instructors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
        email: z
          .email("อีเมลไม่ถูกต้อง")
          .refine(
            (value) => value.endsWith("@cmu.ac.th"),
            "ต้องเป็นอีเมล @cmu.ac.th",
          ),
      }),
    )
    .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
    .max(3, "มีผู้สอนได้ไม่เกิน 3 คน")
    .refine(
      (items) =>
        new Set(items.map((item) => item.email.toLowerCase())).size ===
        items.length,
      "อีเมลผู้สอนซ้ำกัน",
    ),

  program: z.enum(["CPE", "ISNE"], {
    message: "เลือกหลักสูตร",
  }),

  semester: z.enum(["1", "2", "3"], {
    message: "เลือกภาคการศึกษา",
  }),

  description: z.string().max(100, "รายละเอียดต้องยาวไม่เกิน 100 ตัวอักษร"),

  notifyByEmail: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export function createCourseFormSchema(existingCourses: Course[]) {
  return courseFormSchema.refine(
    (data) => !existingCourses.some((c) => c.courseId === data.courseId),
    {
      message: "รหัสวิชานี้มีอยู่แล้ว",
      path: ["courseId"],
    },
  );
}

import { useState } from "react";
import { Plus, PlusCircle, X, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type DefaultValues } from "react-hook-form";
import { useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  createCourseFormSchema,
  type CourseFormValues,
} from "@/lib/schemas/course-schema";
import { useEnrollmentStore } from "@/lib/enrollment-store";

/**
 *   (Lab 17): เขียนฟอร์มนี้ใหม่ด้วย Zod + React Hook Form
 *   (ดูตัวอย่างใน components/students/add-new-student-dialog.tsx)
 *   - schema ใหม่ที่ src/lib/schemas/course-schema.ts (แทน course-validation.ts)
 *   - ผู้สอนเป็น Array Fields (useFieldArray) — ชื่อ + อีเมล @cmu.ac.th, 1–3 คน
 *   - หลักสูตร (Select), ภาคการศึกษา (Radio Group), รายละเอียด (Textarea 0/100),
 *     รับข่าวสารทางอีเมล (Switch)
 */

const emptyCourseForm: DefaultValues<CourseFormValues> = {
  courseId: "",
  courseTitle: "",
  instructors: [
    {
      name: "",
      email: "",
    },
  ],
  description: "",
  notifyByEmail: false,
};

export function AddNewCourseDialog() {
  const addCourse = useEnrollmentStore((s) => s.addCourse);
  const courses = useEnrollmentStore((s) => s.courses);
  const [open, setOpen] = useState(false);

  const schema = useMemo(() => createCourseFormSchema(courses), [courses]);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyCourseForm,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "instructors",
  });

  const description = useWatch({
    control: form.control,
    name: "description",
  });

  function resetForm() {
    form.reset(emptyCourseForm);
  }

  function onSubmit(values: CourseFormValues) {
    addCourse(values);
    form.reset(emptyCourseForm);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          form.reset(emptyCourseForm);
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusCircle className="h-4 w-4" />
        เพิ่มวิชา
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
            <DialogDescription>
              ลองใส่รหัสวิชาไม่ครบ 6 หลัก ใส่รหัสที่มีอยู่แล้ว
              ใส่อีเมลผู้สอนที่ไม่ใช่ @cmu.ac.th หรือพิมพ์รายละเอียดเกิน 100
              ตัวอักษร แล้วกดบันทึก
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <Controller
              name="courseId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="courseId">รหัสวิชา</FieldLabel>

                  <Input
                    {...field}
                    id="courseId"
                    placeholder="เช่น 261305"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="courseTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="courseTitle">ชื่อวิชา</FieldLabel>

                  <Input
                    {...field}
                    id="courseTitle"
                    placeholder="เช่น Mobile Application Development"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="program"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>หลักสูตร</FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="เลือกหลักสูตร" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="CPE">
                        CPE — วิศวกรรมคอมพิวเตอร์
                      </SelectItem>

                      <SelectItem value="ISNE">
                        ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="semester"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>ภาคการศึกษา</FieldLabel>

                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="1" id="semester-1" />
                      <FieldLabel htmlFor="semester-1">
                        ภาคการศึกษาที่ 1
                      </FieldLabel>
                      <RadioGroupItem value="2" id="semester-2" />
                      <FieldLabel htmlFor="semester-2">
                        ภาคการศึกษาที่ 2
                      </FieldLabel>
                      <RadioGroupItem value="3" id="semester-3" />
                      <FieldLabel htmlFor="semester-3">ภาคฤดูร้อน</FieldLabel>
                    </div>
                  </RadioGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">
                    รายละเอียด (ไม่บังคับ)
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id="description"
                    placeholder="คำอธิบายรายวิชาสั้นๆ"
                    aria-invalid={fieldState.invalid}
                  />

                  <div
                    className={
                      description.length > 100
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {description.length}/100 ตัวอักษร
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel>ผู้สอน</FieldLabel>
              <div className="text-sm text-muted-foreground">
                {fields.length}/3 คน — กรอกชื่อผู้สอน และอีเมล name@cmu.ac.th
                (ห้ามซ้ำกัน)
              </div>

              <div className="grid gap-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-1.5 w-5 shrink-0 text-sm text-muted-foreground">
                      {index + 1}.
                    </span>

                    <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <Controller
                        name={`instructors.${index}.name`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              placeholder="ชื่อผู้สอน"
                              aria-invalid={fieldState.invalid}
                            />

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Controller
                        name={`instructors.${index}.email`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              placeholder="name@cmu.ac.th"
                              aria-invalid={fieldState.invalid}
                            />

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {form.formState.errors.instructors?.root && (
                  <FieldError
                    errors={[form.formState.errors.instructors.root]}
                  />
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      name: "",
                      email: "",
                    })
                  }
                  disabled={fields.length === 3}
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มผู้สอน
                </Button>
              </div>
            </Field>

            <Controller
              name="notifyByEmail"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="notifyByEmail"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />

                    <div>
                      <FieldLabel htmlFor="notifyByEmail">
                        รับข่าวสารทางอีเมล
                      </FieldLabel>

                      <p className="text-sm text-muted-foreground">
                        แจ้งเตือนผู้สอนเมื่อเปิดลงทะเบียน
                      </p>
                    </div>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw className="h-4 w-4" />
              ล้างข้อมูล
            </Button>

            <Button type="submit">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

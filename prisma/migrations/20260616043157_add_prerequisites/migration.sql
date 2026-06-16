-- CreateTable
CREATE TABLE "_CoursePrerequisites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoursePrerequisites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_InstancePrerequisiteCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstancePrerequisiteCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CoursePrerequisites_B_index" ON "_CoursePrerequisites"("B");

-- CreateIndex
CREATE INDEX "_InstancePrerequisiteCourses_B_index" ON "_InstancePrerequisiteCourses"("B");

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePrerequisites" ADD CONSTRAINT "_CoursePrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstancePrerequisiteCourses" ADD CONSTRAINT "_InstancePrerequisiteCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstancePrerequisiteCourses" ADD CONSTRAINT "_InstancePrerequisiteCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "CourseInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClassSubjectStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('class_subject_students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id');
            $table->foreignId('class_subject_id');
            $table->float('diligent_point')->nullable();
            $table->float('midterm_point')->nullable();
            $table->float('final_point')->nullable();
            $table->timestamps();

            $table->foreign('student_id', 'fk_class_subject_students_student_id')->references('id')->on('users');
            $table->foreign('class_subject_id', 'fk_class_subject_students_class_subject_id')->references('id')->on('class_subjects');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('class_subject_students', function (Blueprint $table) {
            $table->dropForeign('fk_class_subject_students_student_id');
            $table->dropForeign('fk_class_subject_students_class_subject_id');
        });
        Schema::dropIfExists('class_subject_students');
    }
}

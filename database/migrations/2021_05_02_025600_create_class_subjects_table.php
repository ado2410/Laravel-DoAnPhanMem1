<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClassSubjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id');
            $table->integer('max_slot');
            $table->foreignId('teacher_id');
            $table->foreignId('subject_id');
            $table->timestamps();

            $table->foreign('teacher_id', 'fk_class_subjects_class_id')->references('id')->on('classes');
            $table->foreign('teacher_id', 'fk_class_subjects_teacher_id')->references('id')->on('users');
            $table->foreign('subject_id', 'fk_class_subjects_subject_id')->references('id')->on('subjects');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('class_subjects', function (Blueprint $table) {
            $table->dropForeign('fk_class_subjects_class_id');
            $table->dropForeign('fk_class_subjects_teacher_id');
            $table->dropForeign('fk_class_subjects_subject_id');
        });
        Schema::dropIfExists('class_subjects');
    }
}

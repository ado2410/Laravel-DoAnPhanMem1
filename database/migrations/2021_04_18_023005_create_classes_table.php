<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClassesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */

    public function up()
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('major_id');
            $table->foreignId('grade_id');
            $table->timestamps();

            $table->foreign('major_id', 'fk_classes_major_id')->references('id')->on('majors');
            $table->foreign('grade_id', 'fk_classes_grade_id')->references('id')->on('grades');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign('fk_classes_major_id');
            $table->dropForeign('fk_classes_grade_id');
        });
        Schema::dropIfExists('classes');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClassSubjectTerms extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('class_subject_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_subject_id');
            $table->foreignId('term_id');
            $table->timestamps();

            $table->foreign('class_subject_id', 'fk_class_subject_terms_class_subject_id')->references('id')->on('class_subjects');
            $table->foreign('term_id', 'fk_class_subject_terms_term_id')->references('id')->on('terms');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('class_subject_terms', function (Blueprint $table) {
            $table->dropForeign('fk_class_subject_terms_class_subject_id');
            $table->dropForeign('fk_class_subject_terms_term_id');
        });
        Schema::dropIfExists('class_subject_terms');
    }
}

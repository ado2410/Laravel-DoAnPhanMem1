<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('email')->unique();
            $table->integer('reset_code')->nullable();
            $table->dateTime('reset_code_at')->nullable();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->boolean('gender');
            $table->date('dob');
            $table->string('address');
            $table->string('phone');
            $table->foreignId('city_id');
            $table->foreignId('role_id');
            $table->foreignId('class_id')->nullable(true);
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('city_id', 'fk_users_city_id')->references('id')->on('cities');
            $table->foreign('role_id', 'fk_users_role_id')->references('id')->on('roles');
            $table->foreign('class_id', 'fk_users_class_id')->references('id')->on('classes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('fk_users_city_id');
            $table->dropForeign('fk_users_role_id');
            $table->dropForeign('fk_users_class_id');
        });
        Schema::dropIfExists('users');
    }
}

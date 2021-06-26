<?php

use App\Http\Controllers\ClassController;
use App\Http\Controllers\ClassStudentController;
use App\Http\Controllers\ClassSubjectController;
use App\Http\Controllers\ClassSubjectStudentController;
use App\Http\Controllers\ClassSubjectTermController;
use App\Http\Controllers\Controller;
use App\Http\Controllers\CreditRegistrationController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\MarkController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TermController;
use App\Http\Controllers\UserController;
use App\Models\Class_;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['web'])->group(function () {
    Route::get('checkLogin', [UserController::class, 'checkLogin'])->name('users.checkLogin');
    Route::post('login', [UserController::class, 'login'])->name('users.login');
    Route::get('logout', [UserController::class, 'logout'])->name('users.logout');
    Route::post('send_code', [UserController::class, 'sendCode'])->name('users.sendCode');
    Route::post('reset_password', [UserController::class, 'resetPassword'])->name('users.resetPassword');
    Route::get('rollback', [LogController::class, 'rollback'])->name('rollback');

    Route::prefix('users')->group(function () {
        Route::post('import', [UserController::class, 'import'])->name('users.import');
        Route::post('{id}/change_avatar', [UserController::class, 'changeAvatar'])->name('users.changeAvatar');
    });

    Route::prefix('subjects')->group(function () {
        Route::post('import', [SubjectController::class, 'import'])->name('subjects.import');
    });

    Route::prefix('classes')->group(function () {
    });

    Route::prefix('classes/{class_id}/class_students')->group(function () {
    });

    Route::prefix('class_subjects')->group(function () {
        Route::get('point/{id}', [ClassSubjectController::class, 'viewPoint'])->name('class_subjects.viewPoint');
    });

    Route::prefix('class_subjects/{class_subject_id}/class_subject_students')->group(function () {
    });

    Route::prefix('terms')->group(function () {
        Route::get('terms', [CreditRegistrationController::class, 'getTermList'])->name('credit_registrations.getTermList');
        Route::get('terms/{term}', [CreditRegistrationController::class, 'getTerm'])->name('credit_registrations.getTerm');
    });

    Route::prefix('terms/{term_id}/class_subject_terms')->group(function () {
        Route::get('register', [ClassSubjectTermController::class, 'registerList'])->name('class_subject_terms.register');
        Route::post('register', [ClassSubjectTermController::class, 'register'])->name('class_subject_terms.register');
        Route::get('print', [ClassSubjectTermController::class, 'print'])->name('class_subject_terms.print');
    });

    Route::resources([
        'users' => UserController::class,
        'subjects' => SubjectController::class,
        'classes' => ClassController::class,
        'classes.class_students' => ClassStudentController::class,
        'class_subjects' => ClassSubjectController::class,
        'class_subjects.class_subject_students' => ClassSubjectStudentController::class,
        'terms' => TermController::class,
        'terms.class_subject_terms' => ClassSubjectTermController::class,
        'marks' => MarkController::class,
        'logs' => LogController::class,
    ]);
});
<?php

namespace App\Providers;

use App\Models\Class_;
use App\Models\ClassStudent;
use App\Models\ClassSubject;
use App\Models\ClassSubjectStudent;
use App\Models\ClassSubjectTerm;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use App\Policies\ClassPolicy;
use App\Policies\ClassStudentPolicy;
use App\Policies\ClassSubjectPolicy;
use App\Policies\ClassSubjectStudentPolicy;
use App\Policies\ClassSubjectTermPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\TermPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Subject::class => SubjectPolicy::class,
        Class_::class => ClassPolicy::class,
        ClassStudent::class => ClassStudentPolicy::class,
        ClassSubject::class => ClassSubjectPolicy::class,
        ClassSubjectStudent::class => ClassSubjectStudentPolicy::class,
        Term::class => TermPolicy::class,
        ClassSubjectTerm::class => ClassSubjectTermPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        //
    }
}

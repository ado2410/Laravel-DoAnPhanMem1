<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;

class ClassSubjectPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function viewAny(User $user)
    {
        return in_array(Auth::user()->role_id, [1, 2, 3]);
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\=ClassSubject  $=ClassSubject
     * @return mixed
     */
    public function view(User $user, $id)
    {
        return in_array(Auth::user()->role_id, [1]);
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return in_array(Auth::user()->role_id, [1]);
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\=ClassSubject  $=ClassSubject
     * @return mixed
     */
    public function update(User $user)
    {
        return in_array(Auth::user()->role_id, [1]);
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\=ClassSubject  $=ClassSubject
     * @return mixed
     */
    public function delete(User $user)
    {
        return in_array(Auth::user()->role_id, [1]);
    }

    /**
     * Determine whether the user can restore the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\=ClassSubject  $=ClassSubject
     * @return mixed
     */
    public function restore(User $user)
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\=ClassSubject  $=ClassSubject
     * @return mixed
     */
    public function forceDelete(User $user)
    {
        //
    }

    public function viewMark(User $user)
    {
        return in_array(Auth::user()->role_id, [2]);
    }
}

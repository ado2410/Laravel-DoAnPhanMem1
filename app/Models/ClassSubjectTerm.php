<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSubjectTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'class_subject_id',
    ];
}

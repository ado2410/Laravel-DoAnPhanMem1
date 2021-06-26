<?php

namespace App\Http\Controllers;

use App\Models\Class_;
use App\Models\ClassSubject;
use App\Models\ClassSubjectStudent;
use App\Models\Subject;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClassSubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', ClassSubject::class);
        
        $selection = [
            'class_subjects.id as id',
            (Auth::user()->role_id == 2 ? 'subjects.name as title' : DB::raw('concat(subjects.name, " - " , concat("K", grades.name, majors.short_name)) as title')),
            'subjects.name as subject_name',
            'teacher_id',
            'users.first_name as teacher_first_name',
            'users.last_name as teacher_last_name',
            DB::raw('concat(users.first_name, " " , users.last_name) as teacher_full_name'),
            DB::raw('(select count(*) from class_subject_students where class_subject_students.class_subject_id = class_subjects.id) as student_number'),
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                'users.name',
                'first_name',
                'last_name',
                'subjects.name',
                DB::raw('concat(users.first_name, " " , users.last_name)'),
                DB::raw('concat("K", grades.name, majors.short_name)'),
            ],
        ];

        $filters = [
            ['column' => 'teacher_id', 'values' => json_decode($request->filter_teacher_id)],
            ['column' => 'subject_id', 'values' => json_decode($request->filter_subject_id)],
        ];

        $description = [
            'class_subject_number' => ClassSubject::count(),
            'filter_teachers' => User::select('id', DB::raw('concat( first_name, " ", last_name) as name'))
                ->where('role_id', 3)
                ->get(),
            'filter_subjects' => Subject::select('id', 'name')->get(),
        ];

        $data = ClassSubject::query()
        ->join('users', 'class_subjects.teacher_id', 'users.id')
        ->join('subjects', 'class_subjects.subject_id', 'subjects.id')
        ->join('classes', 'class_subjects.class_id', 'classes.id')
        ->join('majors', 'majors.id', 'classes.major_id')
        ->join('grades', 'grades.id', 'classes.grade_id');
        if (Auth::user()->role_id == 2)
            $data = $data->whereRaw('class_subjects.id in (select class_subject_id from class_subject_students where student_id = ?)', [Auth::user()->id]);
        else if ((Auth::user()->role_id == 3))
            $data = $data->where('class_subjects.teacher_id', Auth::user()->id);
        $data = $this->indexDB($data, $selection, $searching, $filters);

        return response()->json(['dataSource' => $data->paginate(10), 'description' => $description]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassSubject::class);

        $teachers = User::query()->where('role_id', 3)->select('id', DB::raw('concat(first_name, " " , last_name) as name'))->get();
        $subjects = Subject::select('id', 'name')->get();
        $classes = Class_::join('majors', 'majors.id', 'classes.major_id')
            ->join('grades', 'grades.id', 'classes.grade_id')
            ->select('classes.id as id', DB::raw('concat("K", grades.name, majors.short_name) as name'))->get();
        return response()->json(['teachers' => $teachers, 'subjects' => $subjects, 'terms' => $subjects, 'classes' => $classes]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassSubject::class);

        try {
            $this->insertDB('class_subjects', [
                'class_id' => $request->class_id,
                'max_slot' => $request->max_slot,
                'teacher_id' => $request->teacher_id,
                'subject_id' => $request->subject_id,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Tạo mới lớp học phần thành công']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorizeForUser(Auth::user(), 'view', [ClassSubject::class, $id]);
        
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $this->authorizeForUser(Auth::user(), 'update', ClassSubject::class);

        $data = ClassSubject::find($id);
        return response()->json($data);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $this->authorizeForUser(Auth::user(), 'update', ClassSubject::class);

        try {
            $this->updateDB('class_subjects', $id, [
                'max_slot' => $request->max_slot,
                'teacher_id' => $request->teacher_id,
                'subject_id' => $request->subject_id,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Cập nhật lớp học phần thành công']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'delete', ClassSubject::class);

        try {
            $validate = $this->deleteDB('class_subjects', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Xóa lớp học phần thành công']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa lớp học phần không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    public function viewPoint($id) {
        //$this->authorizeForUser(Auth::user(), 'point', ClassSubject::class);
        
        $data = ClassSubjectStudent::query()
        ->where('class_subject_id', $id)
        ->where('student_id', Auth::user()->id)
        ->first();

        return response()->json($data);
    }
}

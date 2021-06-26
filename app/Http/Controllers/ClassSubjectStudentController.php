<?php

namespace App\Http\Controllers;

use App\Models\ClassSubjectStudent;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClassSubjectStudentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $class_subject_id)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', ClassSubjectStudent::class);
        
        /*$keyword = $request->keyword;
        $data = null;
        if (Auth::user()->role_id == 1 || Auth::user()->role_id == 3) {
            $data = User::query()->join('class_subject_students', 'users.id', 'class_subject_students.student_id')
            ->whereRaw('users.id in (select student_id from class_subject_students where class_subject_id = ?) and class_subject_students.class_subject_id = ?', [$class_subject_id, $class_subject_id]);
            if (Auth::user()->role_id == 3)
                $data = $data->whereRaw('class_subject_id in (select id from class_subjects where teacher_id = ?)', Auth::user()->id);
            if ($keyword != null)
                $data = $data->where(function($query) use ($keyword) { $query->where('users.name', 'like', '%' . $keyword . '%')->orWhere('first_name', 'like', '%' . $keyword . '%')->orWhere('last_name', 'like', '%' . $keyword . '%');});
            $data = $data->select('class_subject_students.id as id', 'users.name as name','first_name', 'last_name', 'diligent_point', 'midterm_point', 'final_point')
            ->paginate(10);
        }
        else if (Auth::user()->role_id == 2) {
            $data = ['data' => $data = User::query()->join('class_subject_students', 'users.id', 'class_subject_students.student_id')
            ->where('users.id', Auth::user()->id)->where('class_subject_id', $class_subject_id)
            ->select('users.id as id', 'first_name', 'last_name', 'diligent_point', 'midterm_point', 'final_point')
            ->first()];
        }

        $description = [
            'student_number' => ClassSubjectStudent::where('class_subject_id', $class_subject_id)->count(),
        ];

        return response()->json(['dataSource' => $data, 'description' => $description]);*/

        //Admin và giảng viên
        if (Auth::user()->role_id == 1 || Auth::user()->role_id == 3) {
            $selection = [
                'class_subject_students.id as id',
                'users.name as name',
                'first_name',
                'last_name',
                'diligent_point',
                'midterm_point',
                'final_point',
            ];
    
            $searching = [
                'keyword' => $request->keyword,
                'columns' => [
                    'users.name',
                    'first_name',
                    'last_name'
                ],
            ];
    
            $filters = [
                
            ];
    
            $description = [
                'student_number' => ClassSubjectStudent::where('class_subject_id', $class_subject_id)->count(),
            ];

            $data = User::query()->join('class_subject_students', 'users.id', 'class_subject_students.student_id')
            ->whereRaw('users.id in (select student_id from class_subject_students where class_subject_id = ?) and class_subject_students.class_subject_id = ?', [$class_subject_id, $class_subject_id]);
            if (Auth::user()->role_id == 3)
                $data = $data->whereRaw('class_subject_id in (select id from class_subjects where teacher_id = ?)', Auth::user()->id);
            $data = $this->indexDB($data, $selection, $searching, $filters);

            return response()->json(['dataSource' => $data->paginate(10), 'description' => $description]);
        }
        //Sinh viên
        else if (Auth::user()->role_id == 2) {
            $data = ['data' => $data = User::query()->join('class_subject_students', 'users.id', 'class_subject_students.student_id')
            ->where('users.id', Auth::user()->id)->where('class_subject_id', $class_subject_id)
            ->select('users.id as id', 'first_name', 'last_name', 'diligent_point', 'midterm_point', 'final_point')
            ->first()];
            return response()->json(['dataSource' => $data, 'description' => []]);
        }
    }
    
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($class_subject_id)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassSubjectStudent::class);

        $students = User::query()->where('role_id', 2)->whereRaw('id not in (select student_id from class_subject_students where class_subject_id = ?)', $class_subject_id)->select('id', DB::raw('concat(name, "-",first_name, " " , last_name) as name'))->get();
        return response()->json(['students' => $students]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $class_subject_id)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassSubjectStudent::class);

        try {
            $next = false;
            foreach($request->student_id as $id) {
                //Lớp học phần đã tồn tại trong học kì
                if (ClassSubjectStudent::where('student_id', $id)->where('class_subject_id', $class_subject_id)->count())
                    continue;
                $this->insertDB('class_subject_students', [
                    'student_id' => $id,
                    'class_subject_id' => $class_subject_id,
                ], true, $next);
                $next = true;
            }
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Thêm sinh viên vào lớp học phần thành công!']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($class_subject_id, $id)
    {
        $this->authorizeForUser(Auth::user(), 'update', ClassSubjectStudent::class);

        $data = ClassSubjectStudent::where('class_subject_id', $class_subject_id)->where('id', $id)->first();
        return response()->json($data);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $class_subject_id, $id)
    {
        $this->authorizeForUser(Auth::user(), 'update', ClassSubjectStudent::class);
        
        try {
            if ($request->diligent_point < 0 || $request->diligent_point > 10)
                return response()->json(['type' => 'error', 'text' => 'Điểm chuyên cần sai. Giá trị từ [0-10]']);
            if ($request->midterm_point < 0 || $request->midterm_point > 10)
                return response()->json(['type' => 'error', 'text' => 'Điểm giữa kì sai. Giá trị từ [0-10]']);
            if ($request->final_point < 0 || $request->final_point > 10)
                return response()->json(['type' => 'error', 'text' => 'Điểm cuối kì sai. Giá trị từ [0-10]']);
            $this->updateDB('class_subject_students', $id, [
                'diligent_point' => $request->diligent_point,
                'midterm_point' => $request->midterm_point,
                'final_point' => $request->final_point,
            ]);
        } catch (Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Đã cập nhật điểm số sinh viên']);
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
            $validate = $this->deleteDB('class_subject_students', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Đã xóa sinh viên ra khỏi lớp học phần']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa sinh viên ra khỏi lớp học phần không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'success', 'text' => $e->getMessage()]);
        }
    }
}

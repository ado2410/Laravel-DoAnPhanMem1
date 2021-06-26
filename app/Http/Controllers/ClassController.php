<?php

namespace App\Http\Controllers;

use App\Models\Class_;
use App\Models\Faculty;
use App\Models\Grade;
use App\Models\Major;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function index(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', Class_::class);

        $selection = [
            'classes.id as id',
            DB::raw('concat("K", grades.name, majors.short_name) as class_name'),
            'major_id',
            'majors.name as major_name',
            'grade_id',
            DB::raw('(select count(*) from users where class_id = classes.id) as student_number'),
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                DB::raw('concat("K", grades.name, majors.short_name)'),
                'majors.name',
            ],
        ];

        $filters = [
            ['column' => 'grade_id', 'values' => json_decode($request->filter_grade_id)],
            ['column' => 'major_id', 'values' => json_decode($request->filter_major_id)],
            ['column' => 'faculty_id', 'values' => json_decode($request->filter_faculty_id)],
        ];

        $description = [
            'class_number' => Class_::count(),
            'filter_grades' => Grade::orderByDesc('id')->select('id', DB::raw('concat("K", name) as name'))->get(),
            'filter_majors' => Major::select('id', 'name')->get(),
            'filter_faculties' => Faculty::select('id', 'name')->get(),
        ];

        $data = Class_::query()
        ->join('majors', 'classes.major_id', 'majors.id')
        ->join('grades', 'classes.grade_id', 'grades.id');
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
        $this->authorizeForUser(Auth::user(), 'create', Class_::class);

        $majors = Major::get();
        $grades = Grade::get();
        return response()->json(['majors' => $majors, 'grades' => $grades]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', Class_::class);

        try {
            if (Class_::where('major_id', $request->major_id)->where('grade_id', $request->grade_id)->count() > 0)
                return response()->json(['type' => 'error', 'text' => 'Lớp sinh hoạt đã tồn tại']);

            $this->insertDB('classes', [
                'major_id' => $request->major_id,
                'grade_id' => $request->grade_id,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
            return response()->json(['type' => 'success', 'text' => 'Tạo lớp sinh hoạt thành công!']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorizeForUser(Auth::user(), 'view', Class_::class);
        
        $data = Class_::join('majors', 'classes.major_id', 'majors.id')
        ->join('grades', 'classes.grade_id', 'grades.id')
        ->select('classes.id as class_id', DB::raw('concat("K", grades.name, majors.short_name) as class_name'), 'major_id', 'majors.name as major_name', 'grade_id')   
        ->find($id);

        if (empty($data)) {
            return response()->json(['type' => 'error', 'text' => 'Lớp sinh hoạt không tồn tại!']);
        }
        else {
            return response()->json(['type' => 'success', 'text' => '', 'data' => $data]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $this->authorizeForUser(Auth::user(), 'update', Class_::class);

        $data = Class_::find($id);
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
        $this->authorizeForUser(Auth::user(), 'update', Class_::class);
        
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'delete', Class_::class);

        try {
            $validate = $this->deleteDB('classes', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Xóa lớp sinh hoạt thành công']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa lớp sinh hoạt không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }
}

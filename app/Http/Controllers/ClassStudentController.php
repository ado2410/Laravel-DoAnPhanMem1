<?php

namespace App\Http\Controllers;

use App\Models\ClassStudent;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClassStudentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $class_id)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', ClassStudent::class);

        $selection = [
            'id',
            'name',
            'first_name',
            'last_name',
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                DB::raw('name'),
                'first_name',
                'last_name',
            ],
        ];

        $filters = [

        ];

        $description = [
            'student_number' => User::where('class_id', $class_id)->count(),
        ];

        $data = User::where('class_id', $class_id);
        $data = $this->indexDB($data, $selection, $searching, $filters);

        return response()->json(['dataSource' => $data->paginate(10), 'description' => $description]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($class_id)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassStudent::class);

        $students = User::query()->where('role_id', 2)->where('class_id', null)->select('id', DB::raw('concat(name, "-", first_name, " " , last_name) as name'))->get();
        return response()->json(['students' => $students]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $class_id)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassStudent::class);
        
        try {
            $next = false;
            foreach($request->student_id as $id) {
                //Tài khoản không phải là sinh viên
                if(User::query()->where('role_id', 2)->find($id)->count() == 0)
                    continue;
                //Sinh viên đã tồn tại trong lớp khác
                if (User::query()->where('id', $id)->where('class_id', null)->count() == 0)
                    continue;
                $this->updateDB('users', $id, [
                    'class_id' => $class_id,
                ], true, $next);
                $next = true;
            }
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Đã thêm sinh viên vào lớp sinh hoạt']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($class_id, $student_id)
    {
        $this->authorizeForUser(Auth::user(), 'view', ClassStudent::class);
        
        $userController = new UserController();

        return $userController->show($student_id);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'delete', ClassStudent::class);

        try {
            $ids = $request->ids;
            $next = false;
            foreach ($ids as $id) {
                $this->updateDB('users', $id, [
                    'class_id' => null,
                ], true, $next);
                $next = true;
            }
            return response()->json(['type' => 'success', 'text' => 'Xóa sinh viên ra khỏi lớp thành công']);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }
}

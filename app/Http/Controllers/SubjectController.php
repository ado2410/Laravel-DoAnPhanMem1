<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery\Matcher\Subset;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', Subject::class);

        $selection = [
            '*',
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                'code',
                'name',
            ],
        ];

        $filters = [
		    
        ];

        $description = [
            'subject_number' => Subject::count(),
        ];

        $data = Subject::query();
        $data = $this->indexDB($data, $selection, $searching, $filters);

        return response()->json(['dataSource' => $data->paginate(10), 'description' => $description]);
    }

    /*public function import(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', User::class);

        try {
            $data = $this->csvToArray($request->import);
            $validate = $this->validateImport('subjects', $data);
            if ($validate == null) {
                Subject::insert($data);
                return response()->json(['success' => true]);
            }
            return response()->json(['type' => 'success', 'text' => 'Nhập thành công. ' . $validate]);
        } catch (Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }*/

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $this->authorizeForUser(Auth::user(), 'create', Subject::class);

        return response()->json(null);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', Subject::class);

        if (Subject::query()->where('code', $request->code)->count() > 0)
            return response()->json(['type' => 'error', 'text' => 'Mã học phần đã tồn tại']);
        
        try {
            $this->insertDB('subjects', [
                'code' => $request->code,
                'name' => $request->name,
                'credit_number' => $request->credit_number,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Tạo học phần mới thành công']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorizeForUser(Auth::user(), 'view', Subject::class);
        
        $data = Subject::find($id);
        if (empty($data)) {
            return response()->json(null);
        }
        else {
            return response()->json($data);
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
        $this->authorizeForUser(Auth::user(), 'update', Subject::class);

        $data = Subject::find($id);
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
        $this->authorizeForUser(Auth::user(), 'update', Subject::class);

        if (Subject::query()->where('code', $request->code)->where('id', '<>', $id)->count() > 0)
            return response()->json(['type' => 'error', 'text' => 'Mã học phần đã tồn tại']);
        try {
            $this->updateDB('subjects', $id, [
                'code' => $request->code,
                'name' => $request->name,
                'credit_number' => $request->credit_number,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Cập nhật học phần thành công']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'delete', Subject::class);
        
        try {
            $validate =  $this->deleteDB('subjects', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Đã xóa học phần']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa học phần không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }
}

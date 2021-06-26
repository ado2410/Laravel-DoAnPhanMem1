<?php

namespace App\Http\Controllers;

use App\Mail\PasswordReset;
use App\Models\City;
use App\Models\Class_;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', User::class);
        
        $selection = [
            'users.id as user_id',
            'users.name as user_name',
            'email', 'first_name',
            'last_name',
            'role_id',
            'roles.name as role_name',
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                'users.name',
                'first_name',
                'last_name',
                'email',
            ],
        ];

        $filters = [
            ['column' => 'role_id', 'values' => json_decode($request->filter_role_id)],
        ];

        $description = [
            'user_number' => User::count(),
            'admin_number' => User::where('role_id', 1)->count(),
            'teacher_number' => User::where('role_id', 3)->count(),
            'student_number' => User::where('role_id', 2)->count(),
            'filter_roles' => Role::all(),
        ];

        $user_id = Auth::user()->id;
        $role_id = Auth::user()->role_id;
        $data = User::join('roles','users.role_id', 'roles.id');
            if ($role_id != 1)
                $data = $data->where('users.id', $user_id);
        $data = $this->indexDB($data, $selection, $searching, $filters);

        return response()->json(['dataSource' => $data->paginate(10), 'description' => $description]);
    }

    public function import(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', User::class);
        
        try {
            $cities = City::all();
            $roles = Role::all();
            $classes = Class_::join('majors', 'classes.major_id', 'majors.id')
                ->join('grades', 'classes.grade_id', 'grades.id')
                ->select('classes.id as id', 'majors.short_name as major_short_name', 'grades.name as grade_name')
                ->get();
            //Chuyển csv sang mảng
            $data = $this->csvToArray($request->import);

            foreach ($data as $key => $item) {
                //Mã hóa mật khẩu
                $data[$key]['password'] = Hash::make($item['password']);

                //Chuyển giới tính chuỗi sang số
                $data[$key]['gender'] = $item['gender'] == 'Nam' ? 0 : 1;

                //Chuyển ngày sinh số sang chuỗi ngày
                $data[$key]['dob'] = date('Y-m-d', ($item['dob'] - 25569) * 86400);

                //Chuyển tên thành phố từ chuỗi sang mã
                $data[$key]['city_id'] = $cities->filter(function ($city) use ($item) {
                     return $city->name ==  $item['city_id'];
                })->first()->id;

                //Chuyển vai trò từ chuỗi sang mã
                $data[$key]['role_id'] = $roles->filter(function ($role) use ($item) {
                    return $role->name == $item['role_id'];
                })->first()->id;

                //Chuyển class từ tên sang mã
                $data[$key]['class_id'] = $classes->filter(function ($class) use ($item) {
                    $major_short_name = substr($item['class_id'], -2, 2);
                    $grade_name = substr($item['class_id'], 1, strlen($item['class_id']) - 3);
                    return $class->major_short_name ==  $major_short_name && $class->grade_name == $grade_name;
                })->first()->id;
            }
            $info = $this->importDB('users', $data);
            if ($info)
                return response()->json(['type' => 'error', 'text' => $info]);
            else
                return response()->json(['type' => 'success', 'text' => 'Nhập danh sách tài khoản thành công']);
        } catch (Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    
    public function create()
    {
        $this->authorizeForUser(Auth::user(), 'create', User::class);
        
        //[id, name]
        $cities = City::query()->get();
        $classes = Class_::query()
        ->join('majors', 'classes.major_id', 'majors.id')
        ->join('grades', 'classes.grade_id', 'grades.id')
        ->select('classes.id as id', DB::raw('concat("K", grades.name, majors.short_name) as name'))
        ->get();
        $roles = Role::query()->get();
        $gender = [['id' => 0, 'name' => 'Nam' ], ['id' => 1, 'name' => 'Nữ' ]];
        return response()->json([
            'cities' => $cities,
            'roles' => $roles, 'classes' => $classes,
            'gender' => $gender
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', User::class);

        try {
            //Kiểm tra sự tồn tại của tài khoản
            if (User::query()->where('name', $request->name)->count() > 0)
                return response()->json(['type' => 'error', 'text' => 'Tên tài khoản đã tồn tại']);

            //Kiểm tra mật khẩu và nhập lại mật khẩu trùng khớp
            if (strcmp($request->confirm_pasword, $request->pasword) != 0)
                return response()->json(['type' => 'error', 'text' => 'Mật khẩu và nhập lại mật khẩu không khớp']);
            
            //Kiểm tra email đã tồn tại
            if (User::where('email', $request->email)->count() > 0)
                return response()->json(['type' => 'error', 'text' => 'Tên email đã tồn tại']);

            $this->insertDB('users', [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'address' => $request->address,
                'phone' => $request->phone,
                'city_id' => $request->city_id,
                'role_id' => $request->role_id,
                'class_id' => $request->role_id == 2 ? $request->class_id : null,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Tạo tài khoản thành công']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorizeForUser(Auth::user(), 'view', [User::class, $id]);
        
        $data = User::find($id);
        if (empty($data)) {
            return response()->json(['type' => 'error', 'text' => 'Người dùng không tồn tại']);
        }
        else {
            $data = User::query()->join('roles','users.role_id', 'roles.id')
            ->join('cities','users.city_id', 'cities.id')
            ->join('countries','cities.country_id', 'countries.id')
            ->leftJoin('classes', 'users.class_id', 'classes.id')
            ->leftJoin('majors', 'classes.major_id', 'majors.id')
            ->leftJoin('grades', 'classes.grade_id', 'grades.id')
            ->select('users.id as user_id', 'users.name as user_name', 'email', 'first_name', 'last_name', DB::raw('concat(first_name, " ",last_name) as full_name'), 'gender', 'dob', 'address', 'phone', 'city_id', 'cities.name as city_name', 'countries.name as country_name', 'role_id', 'roles.name as role_name', 'classes.id as class_id', DB::raw('concat("K", grades.name, majors.short_name) as class_name'))
            ->find($id);
            return response()->json(['type' => 'success', 'text' => '', 'data' => $data, 'imageExists' => Storage::disk('public')->exists('images/users/' . $id . '.png')]);
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
        $this->authorizeForUser(Auth::user(), 'update', User::class);

        $data = User::query()->find($id);
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
        $this->authorizeForUser(Auth::user(), 'update', User::class);

        try {
            if ($request->password != $request->confirm_password)
                return response()->json(['type' => 'error', 'text' => 'Mật khẩu và nhập lại mật khẩu không khớp']);
            
            $data = [
                'email' => $request->email,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'address' => $request->address,
                'phone' => $request->phone,
                'city_id' => $request->city_id,
                'role_id' => $request->role_id,
                'class_id' => $request->role_id == 2 ? $request->class_id : null,
                'avatar' => $request->avatar,
            ];

            if ($request->password != '')
                $data['password'] = Hash::make($request->password);
            
            $this->updateDB('users', $id, $data);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Cập nhật tài khoản thành công']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'delete', User::class);

        if (in_array(1, $request->ids))
            return response()->json(['type' => 'error', 'text' => 'Không thể xóa được tài khoản admin']);
        
        try {
            $validate =  $this->deleteDB('users', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Xóa tài khoản thành công']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa tài khoản không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    public function checkLogin() {
            if (Auth::check())
                return response()->json(Auth::user());
            else
                return response()->json(false);
    }

    public function login(Request $request) {
        if (Auth::attempt(['name' => $request->user_name, 'password' => $request->password], true)) {
            return response()->json(['type' => 'success', 'text' => 'Đã đăng nhập', 'data' => Auth::user()]);
        }
        return response()->json(['type' => 'error', 'text' => 'Tài khoản hoặc mật khẩu không đúng!']);
    }

    public function logout() {
        Auth::logout();
        return response()->json(['type' => 'success']);
    }

    public function sendCode(Request $request) {
        try {
            $dataSource = User::where('name', $request->email)->orWhere('email', $request->email)->first();
            if ($dataSource == null)
                return response()->json(['type' => 'error', 'text' => 'Tên tài khoản hoặc email không tồn tại!']);
            $data = ['code' => rand(111111, 999999), 'name' => $dataSource->first_name . " " . $dataSource->last_name];
            $user = User::find($dataSource->id);
            $user->reset_code = $data['code'];
            $user->reset_code_at = Carbon::now();
            $user->save();
            Mail::to($dataSource->email)->send(new PasswordReset($data));
        
            if (Mail::failures()) {
                return response()->json(['type' => 'error', 'text' => 'Không gửi được email! Vui lòng thử lại.']);
            } else {
                return response()->json(['type' => 'success', 'text' => 'Đã gửi mã xác nhận đến tài khoản.', 'data' => ['email' => $request->email]]);
            }
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    public function resetPassword(Request $request) {
        try {
            $user = User::where('name', $request->email)->orWhere('email', $request->email)->first();
            if ($user == null)
                return response()->json(['type' => 'error', 'text' => 'Tên tài khoản hoặc email không tồn tại!']);
            if ($user->reset_code == null)
                return response()->json(['type' => 'error', 'text' => 'Chưa có mã xác nhận, vui lòng nhập lại tên tài khoản hoặc email để gửi mã xác nhận!']);
            if ($user->reset_code != $request->code)
                return response()->json(['type' => 'error', 'text' => 'Mã xác nhận không đúng!']);
            
            $date = new Carbon($user->reset_code_at);
            $currentDate = Carbon::now();
            if ($date->diffInSeconds($currentDate) > 60*5)
                return response()->json(['type' => 'error', 'text' => 'Mã xác nhận đã hết hạn!']);
            if ($request->password != $request->comfirmed_password)
                return response()->json(['type' => 'error', 'text' => 'Mật khẩu không khớp!']);
            
            $newUser = User::query()->find($user->id);
            $newUser->reset_code = null;
            $newUser->reset_code_at = null;
            $newUser->password = Hash::make($request->password);
            $newUser->save();
            return response()->json(['type' => 'success', 'text' => 'Đặt lại mật khẩu thành công']);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    public function changeAvatar(Request $request, $id)
    {
        $this->authorizeForUser(Auth::user(), 'changeAvatar', [User::class, $id]);
        try {
            $this->updateDB('users', $id, [
                'avatar' => $request->avatar,
            ], false);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Đổi avatar thành công! mở lại khung để cập nhật ảnh hiển thị.']);
    }
}

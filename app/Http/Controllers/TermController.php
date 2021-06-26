<?php

namespace App\Http\Controllers;

use App\Models\Class_;
use App\Models\Term;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TermController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public static function get() {
        //Ghi chú: Dùng cả trong ClassSubjectTermController phần register...
        $data = Term::query();
        if (Auth::user()->role_id == 2) {
                $data = $data->where('class_id', Auth::user()->class_id);
            $data = $data->where('open_registration', 1)->where('registration_start', '<', Carbon::now())->where('registration_end', '>', Carbon::now());
        }
        return $data;
    }

    public function index(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', Term::class);

        $selection = [
            'terms.id as id',
            DB::raw('concat("K", grades.name, majors.short_name) as class_name'),
            'starting_year', 'end_year', DB::raw('concat(starting_year, " - " , end_year) as year'),
            'registration_start', 'registration_end', 'open_registration',
            DB::raw('(select count(*) from class_subject_terms where term_id = terms.id) as class_subject_number'),
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                'starting_year',
                'end_year',
            ],
        ];

        $filters = [
		    ['column' => 'class_id', 'values' => json_decode($request->filter_class_id)],
        ];

        $description = [
            'term_number' => Term::count(),
            'filter_classes' => Class_::join('majors', 'classes.major_id', 'majors.id')
                ->join('grades', 'classes.grade_id', 'grades.id')
                ->select('classes.id as id', DB::raw('concat("K", grades.name, majors.short_name) as name'))
                ->get(),
            'filter_opening'=> [
                ['id' => 1, 'name' => 'Mở đăng ký'],
                ['id' => 2, 'name' => 'Chưa tới thời điểm đăng ký'],
                ['id' => 3, 'name' => 'Hết hạn đăng ký'],
                ['id' => 4, 'name' => 'Đóng đăng ký'],
            ],
        ];

        $data = $this->get()->join('classes', 'classes.id', 'class_id')
            ->join('majors', 'majors.id', 'classes.major_id')
            ->join('grades', 'grades.id', 'classes.grade_id');
        $filter_opening_id = json_decode($request->filter_opening_id);
        if ($filter_opening_id) {
            if (in_array(1, $filter_opening_id)) {
                $data = $data->where('open_registration', 1)
                    ->where('registration_start', '<', Carbon::now())
                    ->where('registration_end', '>', Carbon::now());
            }
            if (in_array(2, $filter_opening_id)) {
                $data = $data->orWhere('open_registration', 1)
                    ->where('registration_start', '>', Carbon::now());
            }
            if (in_array(3, $filter_opening_id)) {
                $data = $data->orWhere('open_registration', 1)
                    ->where('registration_end', '<', Carbon::now());
            }
            if (in_array(4, $filter_opening_id)) {
                $data = $data->orWhere('open_registration', 0);
            }
        }
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
        $this->authorizeForUser(Auth::user(), 'create', Term::class);

        $open_registration = [['id' => 0, 'name' => 'Đóng đăng ký'], ['id' => 1, 'name' => 'Mở đăng ký']];
        $classes = Class_::join('majors', 'majors.id', 'classes.major_id')
        ->join('grades', 'grades.id', 'classes.grade_id')
        ->select('classes.id as id', DB::raw('concat("K", grades.name, majors.short_name) as name'))->get();

        return response()->json(['open_registration' => $open_registration, 'classes' => $classes]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'create', Term::class);

        try {
            $this->insertDB('terms', [
                'open_registration' => $request->open_registration,
                'registration_start' => $request->registration_start,
                'registration_end' => $request->registration_end,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Tạo học kì mới thành công']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorizeForUser(Auth::user(), 'view', Term::class);
        
        return response()->json(['type' => 'success']);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $this->authorizeForUser(Auth::user(), 'update', Term::class);

        $data = Term::find($id);
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
        $this->authorizeForUser(Auth::user(), 'update', Term::class);

        try {
            $this->updateDB('terms', $id, [
                'class_id' => $request->class_id,
                'starting_year' => $request->starting_year,
                'end_year' => $request->end_year,
                'open_registration' => $request->open_registration,
                'registration_start' => $request->registration_start,
                'registration_end' => $request->registration_end,
                'avatar' => $request->avatar,
            ]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Cập nhật học kì thành công']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $this->authorizeForUser(Auth::user(), 'delete', Term::class);

        try {
            $validate =  $this->deleteDB('terms', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Đã xóa học kì']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa tín chỉ không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'success', 'text' => $e->getMessage()]);
        }
    }
}

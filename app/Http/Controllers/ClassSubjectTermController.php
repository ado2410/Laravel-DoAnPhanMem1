<?php
namespace App\Http\Controllers;

use App\Models\Class_;
use App\Models\ClassSubject;
use App\Models\ClassSubjectStudent;
use App\Models\ClassSubjectTerm;
use App\Models\Term;
use TCPDF;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use PDF;
use TCPDF_FONTS;

class ClassSubjectTermController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request, $term_id)
    {
        $this->authorizeForUser(Auth::user(), 'viewAny', ClassSubjectTerm::class);

        $selection = [
            'class_subject_terms.id as id',
            'class_subjects.id as class_subject_id',
            'subjects.name as subject_name',
            'teacher_id',
            'users.first_name as teacher_first_name',
            'users.last_name as teacher_last_name',
            DB::raw('concat(users.first_name, " " , users.last_name) as teacher_full_name'),
            DB::raw('(select count(*) from class_subject_students where class_subject_students.class_subject_id = class_subjects.id) as student_number'),
            'registration_start',
            'registration_end',
            'credit_number',
            'subjects.code as code',
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                'subjects.name', 
                'users.first_name',
                'users.last_name',
            ],
        ];

        $filters = [
		    
        ];

        $description = [
            'class_subject_number' => ClassSubjectTerm::where('term_id', $term_id)->count(),
        ];

        $data = ClassSubject::join('users', 'class_subjects.teacher_id', 'users.id')
            ->join('subjects', 'class_subjects.subject_id', 'subjects.id')
            ->join('class_subject_terms', 'class_subjects.id', 'class_subject_terms.class_subject_id')
            ->join('terms', 'terms.id', 'class_subject_terms.term_id')
            ->where('class_subject_terms.term_id' , $term_id);
        $data = $this->indexDB($data, $selection, $searching, $filters);

        return response()->json(['dataSource' => $data->paginate(10), 'description' => $description]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create($term_id)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassSubjectTerm::class);

        $classSubjects = ClassSubject::join('subjects', 'class_subjects.subject_id', 'subjects.id')
            ->join('classes', 'class_subjects.class_id', 'classes.id')
            ->join('majors', 'majors.id', 'classes.major_id')
            ->join('grades', 'grades.id', 'classes.grade_id')
            ->whereRaw('class_subjects.id not in (select class_subject_id from class_subject_terms where term_id = ?)', $term_id)
            ->select('class_subjects.id as id', DB::raw('concat(subjects.name, " - " , concat("K", grades.name, majors.short_name)) as name'))
            ->get();
        return response()->json(['class_subjects' => $classSubjects]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, $term_id)
    {
        $this->authorizeForUser(Auth::user(), 'create', ClassSubjectTerm::class);

        try {
            $next = false;
            foreach($request->class_subject_id as $id) {
                //Sinh viên đã tồn tại trong lớp
                if (ClassSubjectTerm::where('class_subject_id', $id)->where('term_id', $term_id)->count())
                    continue;
                $this->insertDB('class_subject_terms', [
                    'class_subject_id' => $id,
                    'term_id' => $term_id,
                ], true, $next);
                $next = true;
            }
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
        return response()->json(['type' => 'success', 'text' => 'Đã thêm lớp học phần vào học kì']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $this->authorizeForUser(Auth::user(), 'view', [ClassSubjectTerm::class, $id]);
        
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $this->authorizeForUser(Auth::user(), 'update', ClassSubjectTerm::class);

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
        $this->authorizeForUser(Auth::user(), 'update', ClassSubjectTerm::class);
        
        return response()->json(['type' => 'success']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'delete', ClassSubjectTerm::class);

        try {
            $validate =  $this->deleteDB('class_subject_terms', $request->ids, $request->deleteRelation == 1 ? true : false);
            if ($validate === null)
                return response()->json(['type' => 'success', 'text' => 'Đã xóa lớp học phần ra khỏi học kì']);
            else
                return response()->json(['type' => 'error', 'text' => 'Xóa lớp học phần ra khỏi lớp sinh hoạt không thành công. ' . $validate]);
        } catch(Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    public function registerList($term_id) {
        $this->authorizeForUser(Auth::user(), 'register', ClassSubjectTerm::class);
        
        $data = ClassSubjectStudent::query()->where('student_id', Auth::user()->id)->whereRaw('class_subject_id in (select class_subject_id from class_subject_terms where term_id = ?)', $term_id)->get()->pluck('class_subject_id');
        return response()->json($data);
    }

    public function register(Request $request, $term_id) {
        $this->authorizeForUser(Auth::user(), 'register', ClassSubjectTerm::class);
        try {
            //Kiểm tra cho phép đăng ký
            if (!TermController::get()->where('id', $term_id)->count())
                return response()->json(['type' => 'error', 'text' => 'Học kì này đã bị khóa đăng ký tín chỉ hoặc là chưa tới thời điểm đăng ký hoặc đã hết thời gian đăng ký']);
            $list = $request->list;
            $data = ClassSubjectStudent::query()->where('student_id', Auth::user()->id)->whereRaw('class_subject_id in (select class_subject_id from class_subject_terms where term_id = ?)', $term_id)->get();
            $addList = [];
            $delList = [];
            $now = Carbon::now()->toDateTimeString();
            foreach($list as $item) {
                if (!$data->where('class_subject_id', $item)->count()) {
                    array_push($addList, ['student_id' => Auth::user()->id, 'class_subject_id' => $item, 'created_at' => $now, 'updated_at' => $now]);
                }
            }
            foreach($data as $item) {
                if (!in_array($item->class_subject_id, $list)) {
                    array_push($delList, $item->id);
                }
            }
            ClassSubjectStudent::destroy($delList);
            ClassSubjectStudent::insert($addList);
            return response()->json(['type' => 'success', 'text' => 'Đã cập nhật đăng ký tín chỉ thành công']);
        } catch (Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }

    public function print(Request $request, $term_id) {
        $this->authorizeForUser(Auth::user(), 'register', ClassSubjectTerm::class);
        
        try {
            //Config
            $font = 'freeserif';

            //Get data
            $data = ClassSubject::join('users', 'class_subjects.teacher_id', 'users.id')
                ->join('subjects', 'class_subjects.subject_id', 'subjects.id')
                ->join('class_subject_terms', 'class_subjects.id', 'class_subject_terms.class_subject_id')
                ->join('terms', 'terms.id', 'class_subject_terms.term_id')
                ->join('class_subject_students', 'class_subject_students.class_subject_id', 'class_subjects.id')
                ->where('class_subject_terms.term_id' , $term_id)
                ->where('class_subject_students.student_id', Auth::user()->id)
                ->select('subjects.code as code', 'subjects.name as name', 'subjects.credit_number as credit_number')
                ->get();

            $id = Auth::user()->name;
            $name = Auth::user()->first_name . ' ' . Auth::user()->last_name;
            $class = Class_::join('majors', 'classes.major_id', 'majors.id')
                ->join('grades', 'classes.grade_id', 'grades.id')
                ->select(DB::raw('concat("K", grades.name, majors.short_name) as class_name'))   
                ->where( 'classes.id', Auth::user()->class_id)->first()->class_name;
            $termData = Term::where('id', $term_id)->first();
            $term = '1';
            $termYear = $termData->starting_year . '-' . $termData->end_year;
            $phone = Auth::user()->phone;
            $time = Carbon::now();
            $date = $time->day;
            $month = $time->month;
            $year = $time->year;

            $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
            
            $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);

            $pdf->AddPage();

            $pdf->SetFont($font, '', 12, '', true);
            $html = <<<HTML
                <style>
                    :root {
                        font-size: 12;
                    }
                    .header {
                        text-align: center;
                        font-size: 13;
                    }
                    .sign {
                        
                    }
                    .center {
                        text-align: center;
                    }
                    .table {
                        border: 1px solid black;
                        border-collapse: collapse;
                        vertical-align: middle;
                        border-spacing: 10px;
                    }
                    .tableHeader {
                        text-align: center;
                    }
                    .tableContent {
                        border-bottom: 1px dotted black;
                    }
                </style>
                <table>
                    <tr>
                        <td class="header" width="40%">PHÂN HIỆU ĐHĐN TẠI KON TUM</td>
                        <td class="header" width="60%"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></td>
                    </tr>
                    <tr>
                        <td class="header"><b>PHÒNG ĐÀO TẠO</b></td>
                        <td class="header"><b>Độc lập - Tự do - Hạnh phúc</b></td>
                    </tr>
                    <tr>
                        <td class="header">---------------</td>
                        <td class="header">----------o0o----------</td>
                    </tr>
                </table>
                <p style="text-align: center; font-size: 15"><b>PHIẾU ĐĂNG KÝ TÍN CHỈ</b></p>
                <p>Họ và tên sinh viên: $name &emsp;&emsp;&emsp; MSSV: $id &emsp;&emsp;&emsp; Lớp: $class</p>
                <p>Học kì: $term &emsp;&emsp;&emsp; Năm học: $termYear &emsp;&emsp;&emsp; Số điện thoại: $phone</p>
                <p>Các học phần đăng ký: </p>
                <table cellpadding="5">
                    <tr>
                        <th class="table tableHeader" width="5%">Số TT</th>
                        <th class="table tableHeader" width="25%">Mã lớp học phần</th>
                        <th class="table tableHeader" width="40%">Tên học phần</th>
                        <th class="table tableHeader" width="10%">Số TC</th>
                        <th class="table tableHeader" width="10%">Lần học</th>
                        <th class="table tableHeader" width="10%">Ghi chú</th>
                    </tr>
            HTML;
            $counter = 0;
            $creditCounter = 0;
            foreach($data as $item) {
                $itemCode = $item->code;
                $itemName = $item->name;
                $itemCreditNumber = $item->credit_number;
                $itemStudyingTime = 1;
                $itemNote = '';

                $counter++;
                $creditCounter += intval($itemCreditNumber);

                $html .= <<<HTML
                    <tr>
                        <td class="table tableContent center">$counter</td>
                        <td class="table tableContent">$itemCode</td>
                        <td class="table tableContent">$itemName</td>
                        <td class="table tableContent center">$itemCreditNumber</td>
                        <td class="table tableContent center">$itemStudyingTime</td>
                        <td class="table tableContent">$itemNote</td>
                    </tr>
                HTML;
            }

            $html .= <<<HTML
                </table>
                <p><b>Tổng số HP đăng ký: $counter Số TC: $creditCounter</b></p>
                <p style="text-align: right"><i>Kon Tum, ngày $date tháng $month năm $year</i></p>
                <table class="sign">
                    <tr>
                        <td class="center"><b>Cố vấn học tập</b></td>
                        <td class="center"><b>Sinh viên đăng ký</b></td>
                    </tr>
                    <tr>
                        <td class="center">(ký và ghi rõ họ tên)</td>
                        <td class="center">(ký và ghi rõ họ tên)</td>
                    </tr>
                </table>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <p style="font-size: 11"><b><u>Ghi chú:</u></b></p>
                <p style="font-size: 10">- Các khiếu nại về kết quả đăng ký học phần với lý do nhờ người khác đăng ký, ghi sai tên học phần, lớp HP đăng ký học, nộp không đúng thời gian quy định đều không được giải quyết.</p>
                <p style="font-size: 10">- Sinh viên đăng ký học với lớp học phần nào, phải theo dõi lịch học của lớp học phần đó sau khi được xét duyệt để tham gia học đúng thời gian quy định.</p>
            HTML;

            $pdf->writeHTML($html, true, false, true, false, '');

            $pdf->Output('DangKyTinChi.pdf', 'I');
        } catch (Exception $e) {
            return response()->json(['type' => 'error', 'text' => $e->getMessage()]);
        }
    }
}

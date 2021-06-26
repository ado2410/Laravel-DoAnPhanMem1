<?php

namespace App\Http\Controllers;

use App\Models\ClassSubject;
use App\Models\ClassSubjectStudent;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MarkController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $this->authorizeForUser(Auth::user(), 'viewMark', ClassSubject::class);
        
        /*$keyword = $request->keyword;
        $term_id = $request->term_id;
        $data = ClassSubjectStudent::join('class_subjects', 'class_subjects.id', 'class_subject_students.class_subject_id')
        ->leftJoin('class_subject_terms', 'class_subject_terms.class_subject_id', 'class_subjects.id')
        ->leftJoin('terms', 'terms.id', 'class_subject_terms.term_id')
        ->join('subjects', 'subjects.id', 'class_subjects.subject_id')
        ->where('student_id', Auth::user()->id);
        if ($term_id)
            $data = $data->where('terms.id', $term_id);
        if ($keyword != null)
            $data = $data->where(function($query) use ($keyword) { $query->where('subjects.code', 'like', '%' . $keyword . '%')->orWhere('subjects.name', 'like', '%' . $keyword . '%');});
        $data = $data->select('class_subject_students.id as class_subject_student_id ', 'subjects.code as subject_code', 'subjects.name as subject_name', 'subjects.credit_number as credit_number', 'starting_year', 'end_year', DB::raw('concat(terms.starting_year, "-", terms.end_year) as year'), 'diligent_point', 'midterm_point', 'final_point', 'class_subject_students.updated_at')
        ->paginate(10);

        $terms = Term::where('class_id', Auth::user()->class_id)->select('id', DB::raw('concat(terms.starting_year, "-", terms.end_year) as name'))->get();

        $description = [
            'terms' => $terms,      
        ];

        return response()->json(['dataSource' => $data, 'description' => $description]);*/

        $selection = [
            'class_subject_students.id as class_subject_student_id ',
            'subjects.code as subject_code',
            'subjects.name as subject_name',
            'subjects.credit_number as credit_number',
            'starting_year', 'end_year',
            DB::raw('concat(terms.starting_year, "-", terms.end_year) as year'),
            'diligent_point',
            'midterm_point',
            'final_point',
            'class_subject_students.updated_at',
        ];

        $searching = [
            'keyword' => $request->keyword,
            'columns' => [
                'subjects.code',
                'subjects.name',
            ],
        ];

        $filters = [
		    ['column' => 'term_id', 'values' => json_decode($request->filter_term_id)],
        ];

        $description = [
            'filter_terms' => Term::where('class_id', Auth::user()->class_id)->select('id', DB::raw('concat(terms.starting_year, "-", terms.end_year) as name'))->get(),
            'marks' => ClassSubjectStudent::join('class_subjects', 'class_subjects.id', 'class_subject_students.class_subject_id')
                ->leftJoin('class_subject_terms', 'class_subject_terms.class_subject_id', 'class_subjects.id')
                ->leftJoin('terms', 'terms.id', 'class_subject_terms.term_id')
                ->groupBy('year')
                ->where('class_subject_students.student_id', Auth::user()->id)
                ->select(DB::raw('concat(terms.starting_year, "-", terms.end_year) as year'), DB::raw('avg((diligent_point*10 + midterm_point*30 + final_point*60)/100) as mark'))
                ->get(),
        ];

        $data = ClassSubjectStudent::join('class_subjects', 'class_subjects.id', 'class_subject_students.class_subject_id')
        ->leftJoin('class_subject_terms', 'class_subject_terms.class_subject_id', 'class_subjects.id')
        ->leftJoin('terms', 'terms.id', 'class_subject_terms.term_id')
        ->join('subjects', 'subjects.id', 'class_subjects.subject_id')
        ->where('student_id', Auth::user()->id);
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
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
    public function destroy($id)
    {
        //
    }
}

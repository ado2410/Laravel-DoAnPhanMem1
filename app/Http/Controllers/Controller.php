<?php

namespace App\Http\Controllers;

use ArrayObject;
use Carbon\Carbon;
use DateTime;
use Exception;
use Hamcrest\Type\IsInteger;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use League\CommonMark\Inline\Element\Newline;

use function PHPSTORM_META\map;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected function saveBase64($data, $fileName, $overideExtension = null)
    {
        $image_64 = $data;
        $extension = explode('/', explode(':', substr($image_64, 0, strpos($image_64, ';')))[1])[1];   // .jpg .png .pdf
        $replace = substr($image_64, 0, strpos($image_64, ',')+1); 
      // find substring fro replace here eg: data:image/png;base64,
       $image = str_replace($replace, '', $image_64); 
       $image = str_replace(' ', '+', $image);
       $imageName = $fileName . '.' . ($overideExtension == null ? $extension : $overideExtension);
       Storage::disk('public')->put($imageName, base64_decode($image));
    }

    protected function csvToArray($str) {
        $arr = str_getcsv($str, "\n");
        $header = str_getcsv($arr[0], "\t");
        $data = [];
        $index1 = 0;
        foreach ($arr as $row) {
            if ($index1 == 0) {
                $index1++;
                continue;
            }
            $columns = str_getcsv($row, "\t");
            $index2 = 0;
            foreach($columns as $column) {
                $data[$index1][$header[$index2]] = $column;
                $index2++;
            }
            $index1++;
        }
        return $data;
    }

    protected function validateImport($table, $dataSource) {
        try {
            $data = collect($dataSource)->map(function($row){return collect($row);});
            $dataDB = DB::table($table)->select('*')->get();
            $columns = collect(DB::select(DB::raw('SHOW COLUMNS FROM ' . $table . '')))->map(function($row){return collect($row);});
            $foreignKeys = collect(DB::select(DB::raw('SELECT COLUMN_NAME AS Field, REFERENCED_TABLE_NAME as TableName, REFERENCED_COLUMN_NAME as TableField FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = "' . $table . '" AND REFERENCED_TABLE_NAME IS NOT NULL')))->map(function($row){return collect($row);});
            $foreignPrimaryKeys = [];
            foreach($foreignKeys as $foreignKey) {
                $field = $foreignKey->get('Field');
                $tableField = $foreignKey->get('TableField');
                $tableName = $foreignKey->get('TableName');
                $foreignData = collect(DB::select(DB::raw('select ' . $tableField . ' from ' . $tableName)));
                $foreignPrimaryKeys[$field] = $foreignData;
            }
            //Kiểm tra không có cột mà không cho phép null
            $missingColumns = $columns->where('Null', 'NO')->where('Key', '!=', 'PRI')->whereNotIn('Field', $data->first()->keys());
            if ($missingColumns->isNotEmpty())
                return 'Thiếu trường ' . $missingColumns->first()['Field'] . ' trong file import, là trường bắt buộc phải có trong cơ sở dữ liệu';
            
            $count = 1;
            foreach($data as $dataItem) {
                foreach($columns->whereIn('Field', $data->first()->keys()) as $column) {
                    $field = $column->get('Field');
                    $type = $column->get('Type');
                    $isNull = $column->get('Null') == 'YES' ? true : false;
                    $value = $dataItem->get($field);
                    $key = $column->get('Key');
                    $foreign = $foreignKeys->where('Field', $field)->first();
                    $error = 'Lỗi ở dòng số ' . $count . ': Sai giá trị "' . $value . '" trong cột "' . $field . '" - ';
                    
                    //Kiểm tra xung đột unique value
                    foreach($dataDB->pluck($field) as $dataDBItem) {
                        if ($key == 'UNI' && $value == $dataDBItem)
                            return $error . 'Trùng lặp với cơ sở dữ liệu, yêu cầu mỗi giá trị là duy nhất.';
                    }   
                    //Kiểm tra có giá trị null trong trường không cho phép null
                    if (!$isNull && $value == "")
                        return $error . 'Là trường không được phép null';
                    //Kiểm tra kiểu dữ liệu số
                    if ((strpos($type, 'int') || strpos($type, 'year')) && !is_int($value+0))
                        return $error . 'yêu cầu kiểu dữ liệu là integer';
                        if (strpos($type, 'double') && !is_double($value+0))
                        return $error . 'Yêu cầu kiểu dữ liệu là double';
                    //Kiểm tra kiểu dữ liệu date
                    if ($type == 'date' && !DateTime::createFromFormat('Y-m-d', $value))
                        return $error . 'Yêu cầu kiểu dữ liệu là date: yyyy-mm-dd';
                    //Kiểm tra kiểu dữ liệu datetime
                    if ($type == 'datetime' && !DateTime::createFromFormat('Y-m-d H:i:s', $value))
                        return $error . 'Yêu cầu kiểu dữ liệu là date: yyyy-mm-dd hh:ii::ss';
                    //Kiểm tra khóa ngoại
                    if ($key == 'MUL' && $value != "" && $foreign != null) {
                            if ($foreignPrimaryKeys[$field]->where($foreign->get('TableField'), $value)->isEmpty())
                                return $error . 'Khóa ngoại không tồn tại trong bảng "' . $foreign->get('TableName') . '"';
                    }
                }
                $count++;
            }
        } catch(Exception $e) {
            return $e->getMessage();
        }
        return null;
    }

    //Kiểm tra xóa
    protected function validateDelete(string $table, Array $ids): string {
        try {
            if ($ids == [] || $ids == null)
                return 'Trống, vui lòng chọn bản ghi để xóa!';
            $foreign = collect(DB::select(DB::raw('SELECT TABLE_NAME AS TableName, COLUMN_NAME AS ColumnName, CONSTRAINT_NAME AS ConstraintName, REFERENCED_TABLE_NAME AS ReferencedTableName, REFERENCED_COLUMN_NAME AS ReferencedColumnName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME = "' . $table . '"')))->map(function($row){return collect($row);});
            if ($foreign->count() == 0)
                return "";
            foreach($foreign as $value) {
                $tableName = $value->get('TableName');
                $columnName = $value->get('ColumnName');
                $id = DB::table($tableName)->whereIn($columnName, $ids)->pluck($columnName);
                if (!$id->isEmpty())
                    return "Dữ liệu này được đang được sử dụng. Việc xóa sẽ dẫn đến mất dữ liệu liên quan.\n Nhấn một lần nữa để xác nhận xóa.";
            }
        } catch(Exception $e) {
            return $e->getMessage();
        }
        return "";
    }

    //Index
    protected function indexDB($data, Array $selection = null, Array $searching = null, Array $filters = null) {
        //Searching
        if ($searching != null) {
            $keyword = $searching['keyword'];
            $columns = $searching['columns'];
            $data = $data->where(function($data) use ($keyword, $columns) {
                $first = true;
                foreach ($columns as $column) {
                    if ($first == true)
                        $data = $data->where($column, 'like', '%' . $keyword . '%');
                    else
                        $data->orWhere($column, 'like', '%' . $keyword . '%');
                    $first = false;
                }
            });
        };

        //Filter
        if ($filters != null) {
            foreach ($filters as $filter) {
                $filter_column = $filter['column'];
                $filter_values = $filter['values'];
                if ($filter_values != null)
                    $data = $data->whereIn($filter_column, $filter_values);
            }
        }

        //Selection
        $data = $data->select($selection);

        return $data;
    }

    //Xóa bản ghi liên quan
    protected function deleteRelation(string $table, Array $ids) {
        try {
            if ($ids == [] || $ids == null)
                return;
            $foreign = collect(DB::select(DB::raw('SELECT TABLE_NAME AS TableName, COLUMN_NAME AS ColumnName, CONSTRAINT_NAME AS ConstraintName, REFERENCED_TABLE_NAME AS ReferencedTableName, REFERENCED_COLUMN_NAME AS ReferencedColumnName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME = "' . $table . '"')))->map(function($row){return collect($row);});
            if ($foreign->count() == 0)
                return;
            foreach($foreign as $value) {
                $tableName = $value->get('TableName');
                $columnName = $value->get('ColumnName');
                $tableIds = DB::table($tableName)->whereIn($columnName, $ids)->pluck('id')->toArray();
                $this->deleteRelation($tableName, $tableIds);
                $this->deleteDB($tableName, $tableIds, false, true, true);
            }
        } catch(Exception $e) {
            return $e->getMessage();
        }
    }

    //Chèn cơ sở dữ liệu
    protected function insertDB($table, $data, $addLog = true, $continuePreviousStep = false) {
        $avatar = null;
        if (isset($data['avatar']))
            $avatar = $data['avatar'];
        if (!isset($data['created_at']))
            $data['created_at'] = Carbon::now();
        unset($data['avatar']);
        $id = DB::table($table)->insertGetId($data);
        if ($addLog) {
            $step = DB::table('logs')->orderByDesc('id')->first();
            $nextStep = $step ? $step->step + ($continuePreviousStep ? 0 : 1) : 1;
            DB::table('logs')->insertGetId([
                'step' => $nextStep,
                'type' => 0,
                'table_name' => $table,
                'record_id' => $id,
                'created_at' => Carbon::now(),
            ]);
        }
        if ($avatar)
            $this->saveBase64($avatar, 'images/' . $table . '/' . $id, 'png');
    }

    //Import
    protected function importDB($table, $data, $addLog = true) {
        $validate = $this->validateImport($table, $data);
        $next = false;
        if ($validate == null) {
            foreach ($data as $item) {
                $this->insertDB($table, $item, $addLog, $next);
                $next = true;
            }
        }
        return $validate;
    }

    //Chỉnh sửa cơ sở dữ liệu
    protected function updateDB($table, $id, $data, $addLog = true, $continuePreviousStep = false) {
        $avatar = null;
        if (isset($data['avatar']))
            $avatar = $data['avatar'];
        if (!isset($data['updated_at']))
            $data['updated_at'] = Carbon::now();
        unset($data['avatar']);
        if ($addLog) {
            $step = DB::table('logs')->orderByDesc('id')->first();
            $nextStep = $step ? $step->step + ($continuePreviousStep ? 0 : 1) : 1;
            DB::table('logs')->insertGetId([
                'step' => $nextStep,
                'type' => 1,
                'table_name' => $table,
                'record_id' => $id,
                'data' => json_encode(DB::table($table)->where('id', $id)->select(array_keys($data))->first()),
                'created_at' => Carbon::now(),
            ]);
        }
        if ($data != null)
            DB::table($table)->where('id', $id)->update($data);
        if ($avatar)
            $this->saveBase64($avatar, 'images/' . $table . '/' . $id, 'png');
    }

    //Xóa cơ sở dữ liệu
    protected function deleteDB(string $table, Array $ids, bool $deleteRelation, $addLog = true, $continuePreviousStep = false) {
            $step = DB::table('logs')->orderByDesc('id')->first();
            $nextStep = $step ? $step->step + ($continuePreviousStep ? 0 : 1) : 1;
            if ($deleteRelation == true) {
                DB::table('logs')->insertGetId([
                    'step' => $nextStep,
                    'type' => -1,
                    'table_name' => '',
                    'record_id' => 0,
                    'created_at' => Carbon::now(),
                    'data' => ''
                ]);
                $this->deleteRelation($table, $ids);
            }
            $validate = $this->validateDelete($table, $ids);
            if ($validate == null) {
                foreach ($ids as $id) {
                    if ($addLog) {
                        DB::table('logs')->insertGetId([
                            'step' => $nextStep,
                            'type' => 2,
                            'table_name' => $table,
                            'record_id' => $id,
                            'data' => json_encode(DB::table($table)->where('id', $id)->first()),
                            'created_at' => Carbon::now(),
                        ]);
                    }
                    DB::table($table)->where('id', $id)->delete();
                    $imagePath = 'images/' . $table . '/' . $id . '.png';
                    if (Storage::disk('public')->exists($imagePath))
                        Storage::disk('public')->delete($imagePath);
                }
                return null;
            }
            else
                return $validate;
    }

    //Rollback lại cơ sở dữ liệu
    protected function rollbackDB() {
        $lastLog = DB::table('logs')->orderByDesc('id')->first();
        $log = null;
        if ($lastLog) {
            $logs = DB::table('logs')->where('step', $lastLog->step)->orderByDesc('id')->get();
            foreach ($logs as $log) {
                if ($log->type == 0)
                    $this->deleteDB($log->table_name, [$log->record_id], false, false);
                else if ($log->type == 1)
                    $this->updateDB($log->table_name, $log->record_id, json_decode($log->data, true), false);
                else if ($log->type == 2)
                    $this->insertDB($log->table_name, json_decode($log->data, true), false);
                DB::table('logs')->where('id', $log->id)->delete();
            }
            return response()->json(['type' => 'success', 'text' => 'Đã rollback lại dữ liệu']);
        }
        else
            return response()->json(['type' => 'error', 'text' => 'Không có bản log để rollback']);
    }
}

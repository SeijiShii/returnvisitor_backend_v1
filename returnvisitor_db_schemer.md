#returnvisitor_db
##users
-id primary key (auto_increment)
-user_id varchar(100) これがあるおかげでuser_nameを変更しても一意性が保たれる
-user_name varchar(40)
-password varchar(40)
-updated_at varchar(30) mysqlにはtimestampという機能があるが、クライアント側でも使用するデータのためあえて文字列
-delete_flag tinyint(1) 要はboolean 実際に削除するのではなく削除判定とする。
##places
##persons
##visits
##tags
##response_tags
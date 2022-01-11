const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const fileUpload = require('express-fileupload')

const routerIndex = require('./routes/routerIndex')
const routerReport = require('./routes/routerReport')
const routerSchema = require('./routes/routerSchema')
const routerUtil = require('./routes/routerUtil')

const app = express()
app.use(cors())
// app.options('*', cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

app.use(
  fileUpload({
    createParentPath: true,
  })
)

app.use('/', routerIndex)
app.use('/report', routerReport)
app.use('/schema', routerSchema)
app.use('/util', routerUtil)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

// $env:DEBUG='myapp:*'; npm start

// SHOW open tables WHERE In_use != 0

/*
SHOW status
show variables

MAX_CONN = VAR["max_connections"]  
MAX_USED_CONN = VAR["Max_used_connections"]  
BASE_MEM=VAR["key_buffer_size"] + VAR["query_cache_size"] + VAR["innodb_buffer_pool_size"] + VAR["innodb_additional_mem_pool_size"] + VAR["innodb_log_buffer_size"]  
MEM_PER_CONN=VAR["read_buffer_size"] + VAR["read_rnd_buffer_size"] + VAR["sort_buffer_size"] + VAR["join_buffer_size"] + VAR["binlog_cache_size"] + VAR["thread_stack"] + VAR["tmp_table_size"]  
MEM_TOTAL_MIN=BASE_MEM + MEM_PER_CONN*MAX_USED_CONN  
MEM_TOTAL_MAX=BASE_MEM + MEM_PER_CONN*MAX_CONN
printf "+------------------------------------------+--------------------+\n"  
printf "| %40s | %15.3f MB |\n", "key_buffer_size", VAR["key_buffer_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "query_cache_size", VAR["query_cache_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "innodb_buffer_pool_size", VAR["innodb_buffer_pool_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "innodb_additional_mem_pool_size", VAR["innodb_additional_mem_pool_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "innodb_log_buffer_size", VAR["innodb_log_buffer_size"]/1048576  
printf "+------------------------------------------+--------------------+\n"  
printf "| %40s | %15.3f MB |\n", "BASE MEMORY", BASE_MEM/1048576  
printf "+------------------------------------------+--------------------+\n"  
printf "| %40s | %15.3f MB |\n", "sort_buffer_size", VAR["sort_buffer_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "read_buffer_size", VAR["read_buffer_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "read_rnd_buffer_size", VAR["read_rnd_buffer_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "join_buffer_size", VAR["join_buffer_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "thread_stack", VAR["thread_stack"]/1048576  
printf "| %40s | %15.3f MB |\n", "binlog_cache_size", VAR["binlog_cache_size"]/1048576  
printf "| %40s | %15.3f MB |\n", "tmp_table_size", VAR["tmp_table_size"]/1048576  
printf "+------------------------------------------+--------------------+\n"  
printf "| %40s | %15.3f MB |\n", "MEMORY PER CONNECTION", MEM_PER_CONN/1048576  
printf "+------------------------------------------+--------------------+\n"  
printf "| %40s | %18d |\n", "Max_used_connections", MAX_USED_CONN  
printf "| %40s | %18d |\n", "max_connections", MAX_CONN  
printf "+------------------------------------------+--------------------+\n"  
printf "| %40s | %15.3f MB |\n", "TOTAL (MIN)", MEM_TOTAL_MIN/1048576  
printf "| %40s | %15.3f MB |\n", "TOTAL (MAX)", MEM_TOTAL_MAX/1048576  
printf "+------------------------------------------+--------------------+\n"  
}'
*/

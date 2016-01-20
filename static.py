import os
from subprocess import call
from boto.s3.key import Key
from boto.s3.connection import S3Connection
import sys
import hashlib
import datetime
import paramiko

AWS_API_KEY = 'AKIAJ5322OE4UXMGOOCA'
AWS_SECRET_KEY = '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'
AWS_S3_BUCKET = 'annalise-tingsystems'
location_base = 'static/tingsystems/'
# destination directory name (on s3)
location_js = location_base + 'js'
location_img = location_base + 'img'
location_css = location_base + 'css'
location_fonts = location_base + 'fonts'
temp_dir = 'temp/'
aws_path = None
continued = None
new_files = []
# For copy file in server
remote_server_host = "45.55.165.140"
remote_user_server_host = "root"
remote_port_server_host = 8513
remote_user_file = "tingsystems"
path_file_server = "/home/" + remote_user_file + "/www"
path_upload_file_server = path_file_server + "/index.html"
print(path_upload_file_server)
path_file_local = os.getcwd() + "/" + temp_dir
upload_file = path_file_local + "index.html"
# Ssh connection
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(remote_server_host, port=remote_port_server_host, username=remote_user_server_host)
abs_temp_dir = os.path.abspath(temp_dir)

templates = []
# Copy files from dist/ to temp/
print('Copy files temp...')
res = call(['find dist/ -type f -exec cp {} temp/ \;'], shell=True)
print('Generating hashing...')
return_path = os.getcwd()
new_path = os.getcwd()
new_path = new_path + "/" + temp_dir
for file in os.listdir(abs_temp_dir):
    # generated hash for static file js or css
    filename, file_extension = os.path.splitext(file)
    if '.js' in file_extension:
        no_hash_string = str(datetime.datetime.now())
        hash_string = hashlib.md5(no_hash_string)
        os.chdir(new_path)
        new_name_file = filename + "-" + hash_string.hexdigest() + file_extension
        os.rename(file, new_name_file)
        new_files.append(new_name_file)
    elif '.css' in file_extension:
        no_hash_string = str(datetime.datetime.now())
        hash_string = hashlib.md5(no_hash_string)
        new_name_file = filename + "-" + hash_string.hexdigest() + file_extension
        os.rename(file, new_name_file)
        new_files.append(new_name_file)
os.chdir(return_path)

if sys.version_info[0] is 3:
    continued = input("Copiar archivos a AWS? S/n: ")
else:
    continued = raw_input("Copiar archivos a AWS? S/n: ")

if continued == 'S' or continued == 's':
    for file in os.listdir(abs_temp_dir):
        templates.append(os.path.join(abs_temp_dir, file))

    print('Uploading files:')

    def percent_cb(complete, total):
        sys.stdout.write('.')
        sys.stdout.flush()

    s3_conn = S3Connection(AWS_API_KEY, AWS_SECRET_KEY)
    bucket = s3_conn.get_bucket(AWS_S3_BUCKET)
    for t in templates:
        k = Key(bucket)
        filename, file_extension = os.path.splitext(t)
        if '.js' in file_extension:
            aws_path = os.path.join(location_js, os.path.basename(t))
            # indicated path in aws
            k.key = aws_path
            k.set_contents_from_filename(os.path.abspath(t), cb=percent_cb, num_cb=10)
        elif '.css' in file_extension:
            aws_path = os.path.join(location_css, os.path.basename(t))
            # indicated path in aws
            k.key = aws_path
            k.set_contents_from_filename(os.path.abspath(t), cb=percent_cb, num_cb=10)
            # elif '.jpg' or '.ico' or '.png' in file_extension:
            #     aws_path = os.path.join(location_img, os.path.basename(t))
            # elif '.otf' or '.eot' or '.svg' or '.woff' or '.woff2' in file_extension:
            #     aws_path = os.path.join(location_fonts, os.path.basename(t))
            # else:
            #     print("No se subio " + os.path.basename(t))
            #     print(os.path.basename(t))

    print('Upload complete')
else:
    pass
    # print ("Bye...")
    # sys.exit()
if sys.version_info[0] is 3:
    continued = input("Remplazar el contenido de index.html? S/n: ")
else:
    continued = raw_input("Remplazar el contenido de index.html? S/n: ")

if continued == 'S' or continued == 's':
    print('Remplazando...')
    replacements = {
        'img/favicon.ico': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/favicon.ico',
        'img/ico/apple-touch-icon-144-precomposed.png': 'href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/ico/apple-touch-icon-144-precomposed.png',
        'img/ico/apple-touch-icon-114-precomposed.png': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/ico/apple-touch-icon-114-precomposed.png',
        'img/ico/apple-touch-icon-72-precomposed.png': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/ico/apple-touch-icon-72-precomposed.png',
        'img/ico/apple-touch-icon-57-precomposed.png': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/ico/apple-touch-icon-57-precomposed.png',
        'css/style.min.css': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/css/%s' %
                             new_files[2],
        'img/logo.png': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/logo.png',
        'img/icon.png>': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/img/icon.png',
        'js/vendor.min.js': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/js/%s' %
                            new_files[1],
        'js/annalise.min.js': 'https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/tingsystems/js/%s' %
                              new_files[0]}
    lines = []
    with open('temp/index.html') as infile:
        if sys.version_info[0] is 3:
            for line in infile:
                for src, target in replacements.items():
                    line = line.replace(src, target)
                lines.append(line)
        else:
            for line in infile:
                for src, target in replacements.iteritems():
                    line = line.replace(src, target)
                lines.append(line)
    with open('temp/index.html', 'w') as outfile:
        for line in lines:
            outfile.write(line)
else:
    print("Bye...")
    sys.exit()

if sys.version_info[0] is 3:
    continued = input("Subir el index.html? al servidor S/n: ")
else:
    continued = raw_input("Subir el index.html? al servidor S/n: ")
if continued == 'S' or continued == 's':
    print('Subiendo....')
    cmd = "scp -P " + str(
        remote_port_server_host) + " " + upload_file + " " + remote_user_server_host + "@" + remote_server_host + ":" + path_file_server
    print(cmd)
    res = call([cmd], shell=True)
    print ("CDM result " + str(res))
    print('Ejecutando cambios en el servidor....')
    # Change owner upload file
    cmd_remote = "chown " + remote_user_file + ":" + remote_user_file + " " + path_upload_file_server
    print(cmd_remote)
    std_in, std_out, std_err = ssh.exec_command(cmd_remote)
    std_in.close()
    for line in std_out.read().splitlines():
        print ("std out: %s" % line)
    for line in std_err.read().splitlines():
        print ("std out: %s" % line)
    print ("CMD result: " + str(std_out.channel.recv_exit_status()))
else:
    print("Bye...")
    sys.exit()

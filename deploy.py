__author__ = 'Tingsystems'
import os
from subprocess import call
import sys
import paramiko

# For copy file in server
remote_server_host = "45.55.165.140"
remote_user_server_host = "root"
remote_port_server_host = 8513
remote_user_file = "magu"
path_file_server = "/home/" + remote_user_file + "/www/"
dist_dir = "dist/"
tar_file = 'dist.tar.gz'
path_file_local = os.getcwd() + "/" + tar_file
upload_file = path_file_local + "index.html"
path_upload_file_server = path_file_server + "dist"


# Ssh connection
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(remote_server_host, port=remote_port_server_host, username=remote_user_server_host)

# Functions
def local_cmd(cmd):
    res = call([cmd], shell=True)
    return res


def remote_cmd(cmd):
    std_in, std_out, std_err = ssh.exec_command(cmd)
    std_in.close()
    for line in std_out.read().splitlines():
        print("std out: %s" % line)
    for line in std_err.read().splitlines():
        print("std out: %s" % line)
    print("CMD result: " + str(std_out.channel.recv_exit_status()))

# delete local dist
cmd_delete_dist = "rm -r dist/"
# delete local tar
cmd_delete_local = "rm " + tar_file
# execute gulp build
cmd_gulp = "gulp build"
# Command Tar file
cmd_tar = "tar -zcvf " + " " + tar_file + " " + dist_dir
# Command Upload tar file
cmd_upload = "scp -P " + str(
    remote_port_server_host) + " " + tar_file + " " + remote_user_server_host + "@" + remote_server_host + ":" + path_file_server
# Command UnTar
cmd_un_tar = "tar -xvf " + path_file_server + tar_file + " -C " + path_file_server
print(cmd_un_tar)
# Command Change owner directory
cmd_change_owner = "chown -R " + remote_user_file + ":" + remote_user_file + " " + path_upload_file_server
# Deleted upload file
cmd_delete = "rm " + path_file_server + tar_file

cmd_compress_html = "gulp htmlcompress"
# Executing commands

if sys.version_info[0] is 3:
    continued = input("Eliminar dist/ anterior? S/n: ")
else:
    continued = raw_input("Eliminar dist/ anterior? S/n: ")

if continued == 'S' or continued == 's':
    # Command delete dist
    print(cmd_delete_dist)
    local_cmd(cmd_delete_dist)

if sys.version_info[0] is 3:
    continued = input("Ejecutar gulp build S/n: ")
else:
    continued = raw_input("Ejecutar gulp build S/n: ")

if continued == 'S' or continued == 's':
    # Command gulp
    print(cmd_gulp)
    local_cmd(cmd_gulp)
    local_cmd(cmd_compress_html)

if sys.version_info[0] is 3:
    continued = input("Subir archivos? S/n: ")
else:
    continued = raw_input("Subir archivos? S/n: ")

if continued == 'S' or continued == 's':
    # Compressing files
    print(cmd_tar)
    local_cmd(cmd_tar)
    # Upload tar file
    print(cmd_upload)
    local_cmd(cmd_upload)
    # UnTar
    print(cmd_un_tar)
    remote_cmd(cmd_un_tar)
    # Change owner directory
    print(cmd_change_owner)
    remote_cmd(cmd_change_owner)
    # Deleting upload files
    print(cmd_delete)
    remote_cmd(cmd_delete)
    print (cmd_delete_local)
    local_cmd(cmd_delete_local)

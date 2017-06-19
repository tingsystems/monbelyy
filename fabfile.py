# -*- coding: utf-8 -*-
from __future__ import with_statement
import os
from fabric.api import env, run, local, put
from fabric.contrib.console import confirm
from fabric.contrib.files import exists

# config ssh

env.use_ssh_config = True
env.hosts = ['ts-16']
remote_user = 'moons-www'
remote_path = '/home/' + remote_user + '/www/'
dist_dir = 'dist/'
tar_file = 'dist.tar.gz'
path_file_local = os.getcwd() + '/' + tar_file
path_upload_file_server = remote_path + 'dist'
remote_tar_file = remote_path + tar_file


def update():
    if confirm('¿Eliminar dist anterior?', default=True):
        if exists('dist/'):
            local('rm -r dist/')
    if confirm('¿Ejecutar gulp?', default=True):
        local('gulp build')
        local('gulp htmlcompress')
    if confirm('¿Subir archivos?', default=True):
        local('tar -zcvf %s %s' % (tar_file, dist_dir))
        # upload file
        put(path_file_local, remote_path)
        # uncompress
        run('tar -xvf %s -C %s ' % (remote_tar_file, remote_path))
        # change owner directory
        run('chown -R %s:%s %s' % (remote_user, remote_user, path_upload_file_server))
        # remove dist.tar.gz
        run('rm %s%s ' % (remote_path, tar_file))
        local('rm %s' % tar_file)

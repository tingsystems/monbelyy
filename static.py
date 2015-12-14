import os
from subprocess import call
from boto.s3.key import Key
from boto.s3.connection import S3Connection
import sys

AWS_API_KEY = 'AKIAJ5322OE4UXMGOOCA'
AWS_SECRET_KEY = '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'
AWS_CF_S3_BUCKETS = ('prueba-ts',)
AWS_S3_BUCKET = 'annalise-tingsystems'

# destination directory name (on s3)
location_js = 'static/js'
location_img = 'static/img'
location_css = 'static/css'
location_fonts = 'static/fonts'
templates_dir = 'temp/'
static_dir = 'static/'
failed = open('failers.log', 'w')
aws_path = None

abs_template_dir = os.path.abspath(templates_dir)

print(abs_template_dir)

templates = []

print('Copy files...')
res = call(['find dist/ -type f -exec cp {} temp/ \;'], shell=True)
print('CMD result: ' + str(res))
print('End files...')

for file in os.listdir(abs_template_dir):
    templates.append(os.path.join(abs_template_dir, file))

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
    elif '.css' in file_extension:
        aws_path = os.path.join(location_css, os.path.basename(t))
    elif '.jpg' or '.ico' or '.png' in file_extension:
         aws_path = os.path.join(location_img, os.path.basename(t))
    elif '.otf' or '.eot' or '.svg' or '.woff' or '.woff2' in file_extension:
         aws_path = os.path.join(location_fonts, os.path.basename(t))
    else:
        print("No se subio " + os.path.basename(t))
        print(os.path.basename(t))

    # indicated path in aws
    k.key = aws_path
    k.set_contents_from_filename(os.path.abspath(t), cb=percent_cb, num_cb=10)

print('Upload complete')
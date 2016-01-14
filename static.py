import os
from subprocess import call
from boto.s3.key import Key
from boto.s3.connection import S3Connection
import sys

AWS_API_KEY = 'AKIAJ5322OE4UXMGOOCA'
AWS_SECRET_KEY = '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'
AWS_CF_S3_BUCKETS = ('prueba-ts',)
AWS_S3_BUCKET = 'annalise-tingsystems'
location_base = 'static/'
# destination directory name (on s3)
location_js = location_base + 'js'
location_img = location_base + 'img'
location_css = location_base + 'css'
location_fonts = location_base + 'fonts'
temp_dir = 'temp/'
aws_path = None
continued = None

abs_temp_dir = os.path.abspath(temp_dir)

templates = []
# Copy files from dist/ to temp/
print('Copy files temp...')
res = call(['find dist/ -type f -exec cp {} temp/ \;'], shell=True)

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
        '<link href="img/favicon.ico" rel="shortcut icon" type="favicon">': '<link href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/favicon.ico" rel="shortcut icon" type="favicon">',
        '<link rel="apple-touch-icon-precomposed" sizes="144x144" href="img/ico/apple-touch-icon-144-precomposed.png">': '<link rel="apple-touch-icon-precomposed" sizes="144x144" href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/ico/apple-touch-icon-144-precomposed.png">',
        '<link rel="apple-touch-icon-precomposed" sizes="114x114" href="img/ico/apple-touch-icon-114-precomposed.png">': '<link rel="apple-touch-icon-precomposed" sizes="114x114" href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/ico/apple-touch-icon-114-precomposed.png">',
        '<link rel="apple-touch-icon-precomposed" sizes="72x72" href="img/ico/apple-touch-icon-72-precomposed.png">': '<link rel="apple-touch-icon-precomposed" sizes="72x72" href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/ico/apple-touch-icon-72-precomposed.png">',
        '<link rel="apple-touch-icon-precomposed" href="img/ico/apple-touch-icon-57-precomposed.png">': '<link rel="apple-touch-icon-precomposed" href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/ico/apple-touch-icon-57-precomposed.png">',
        '<link rel="stylesheet" href="css/style.min.css">': '<link rel="stylesheet" href="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/css/style.min.css">',
        '<a class="navbar-brand" ui-sref="home"><img src="img/logo.png"': '<a class="navbar-brand" href="/"><img src="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/logo.png"',
        '<img src="../img/icon.png">': '<img src="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/img/icon.png">',
        '<script src="js/vendor.min.js"></script>': '<script src="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/js/vendor.min.js"></script>',
        '<script src="js/annalise.min.js"></script>': '<script src="https://s3-us-west-2.amazonaws.com/annalise-tingsystems/static/js/annalise.min.js"></script>'}
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
else:
    print("Bye...")
    sys.exit()

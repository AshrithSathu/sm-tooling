"""Run against a deployed S3 configuration: python3 scripts/verify-storage.py /private/login.json"""
import base64
import http.cookiejar
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

credentials = json.load(open(sys.argv[1]))
base = credentials['url'].rstrip('/')
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
client.open(urllib.request.Request(base + '/api/auth/login', data=json.dumps(credentials).encode(), headers={'Content-Type': 'application/json'})).read()
png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6hCkAAAAASUVORK5CYII=')
boundary = 'sm-storage-check'
body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="storage-check.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + png + f'\r\n--{boundary}--\r\n'.encode())
media = json.load(client.open(urllib.request.Request(base + '/api/media/upload-server', data=body, headers={'Content-Type': 'multipart/form-data; boundary=' + boundary})))
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None
try:
    assert media['path'].startswith(base + '/uploads/')
    assert '?' not in media['path'], 'Stored link must not expire'
    try:
        urllib.request.build_opener(NoRedirect()).open(media['path'])
        raise AssertionError('Expected bucket redirect')
    except urllib.error.HTTPError as redirect:
        assert redirect.code == 307
        assert redirect.headers['Cache-Control'] == 'no-store'
        signed = redirect.headers['Location']
    with urllib.request.urlopen(urllib.request.Request(media['path'], method='HEAD')) as response:
        assert int(response.headers['Content-Length']) == len(png)
    with urllib.request.urlopen(signed) as response:
        assert response.read() == png
    with urllib.request.urlopen(urllib.request.Request(signed, headers={'Range': 'bytes=0-7'})) as response:
        assert response.status == 206 and response.read() == png[:8]
    try:
        urllib.request.urlopen(signed.split('?')[0])
        raise AssertionError('Bucket must not allow anonymous reads')
    except urllib.error.HTTPError as error:
        assert error.code in (401, 403)
    print('PASS: upload, permanent link, fresh redirect, exact bytes, range reads, private bucket')
finally:
    client.open(urllib.request.Request(base + '/api/media/' + media['id'], method='DELETE')).read()

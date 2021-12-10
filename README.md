### Build image:

`docker build -t IMAGE_NAME .`

### Run image mapping port 8080 (in the container) to 3000 (on the container's host) in [detached mode](https://docs.docker.com/engine/reference/run/#detached--d):

`docker run -p 3000:8080 -d IMAGE_NAME`


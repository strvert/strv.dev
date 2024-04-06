FROM ubuntu:23.10

RUN apt update && apt install -y curl sudo git

RUN apt install -y nodejs npm
RUN npm install -g n
RUN n 17.9.1
RUN npm install -g yarn

RUN apt clean && rm -rf /var/lib/apt/lists/*

# add suders
RUN echo "ubuntu:ubuntu" | chpasswd && adduser ubuntu sudo
# no password for sudo
RUN echo "ubuntu ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

USER ubuntu
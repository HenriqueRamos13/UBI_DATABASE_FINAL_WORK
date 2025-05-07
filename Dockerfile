FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

COPY schema.sql /schema.sql
COPY seed.sql /seed.sql
COPY init-db.sh /init-db.sh
RUN chmod +x /init-db.sh

ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=Str0ngPassword@

CMD /bin/bash -c "/opt/mssql/bin/sqlservr & sleep 30s && /init-db.sh & wait $!" 
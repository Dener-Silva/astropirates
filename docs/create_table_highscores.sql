create table highscores(

    id bigint not null,
    name varchar(30) not null,
    score bigint not null,
    ts timestamp not null default CURRENT_TIMESTAMP(),

    primary key(id)

);
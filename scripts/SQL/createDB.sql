DROP TABLE IF EXISTS gameCategory CASCADE;
CREATE TABLE gameCategory (
                              gameCategoryId integer primary key GENERATED ALWAYS AS IDENTITY,
                              label varchar not null,
                              description varchar not null
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
                       userId integer primary key GENERATED ALWAYS AS IDENTITY,
                       firstName varchar not null,
                       name varchar not null,
                       birthDate date not null,
                       isAdmin bit not null,
                       email varchar unique not null,
                       password varchar not null,
                       photoPath varchar not null
);

DROP TABLE IF EXISTS event CASCADE;
CREATE TABLE event (
                       eventId integer primary key GENERATED ALWAYS AS IDENTITY,
                       creatorId integer REFERENCES users(userId) DEFERRABLE INITIALLY IMMEDIATE,
                       gameCategoryId integer REFERENCES gameCategory(gameCategoryId) DEFERRABLE INITIALLY IMMEDIATE,
                       creationDate date not null,
                       eventDate date not null,
                       place varchar not null,
                       eventDescription varchar not null,
                       isVerified bit not null,
                       nbMaxPlayer integer not null,
                       adminMessage varchar
);

DROP TABLE IF EXISTS inscription CASCADE;
CREATE TABLE inscription(
                            inscriptionId integer primary key GENERATED ALWAYS AS IDENTITY,
                            eventId integer REFERENCES event(eventId) DEFERRABLE INITIALLY IMMEDIATE not null,
                            userId integer REFERENCES users(userId) DEFERRABLE INITIALLY IMMEDIATE not null
);

DROP TABLE IF EXISTS message CASCADE;
CREATE TABLE message(
                        messageId integer primary key GENERATED ALWAYS AS IDENTITY,
                        sendId integer,
                        eventId integer,
                        content varchar,
                        date varchar
);


INSERT INTO gameCategory (label, description) values ('RPG', 'ROLE PLAY GAMES');
INSERT INTO gameCategory (label, description) values ('Board Games', 'Board games');
INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
    values ('Christophe', 'Bernard', '2001-02-20', CAST(1 as bit), 'christophe.bernard@henallux.be',
    '$2b$10$dGDvoKk29sETHESXK0H54eG/xwu2dWJL8NnAQWMEeKkrceitKyXou', 'c:/photos/1');
INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
    values ('Maxence', 'Delbrouck', '1999-10-25', CAST(0 as bit), 'maxence.delrbouck@gmail.com',
    '$2b$10$i0/Qwo7dASF.VgZd666AHepuJva8hKrabYG6RnQh8JVhD6dhwwmq2', 'c:/photos/2');
INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (1, 1, NOW(), NOW() + interval '1 day' ,'Rue Joseph Calozet', 'Soirée jeux de rôle', CAST(0 as bit), 8);
INSERT INTO inscription (eventId, userId) values (1, 2);
INSERT INTO message (sendId, eventId, content, date) VALUES (2, 1, 'Premier message de test', NOW());
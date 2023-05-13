DROP TABLE IF EXISTS favoriteMovie;


CREATE TABLE IF NOT EXISTS favoriteMovie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    summary VARCHAR(255),
    years VARCHAR(255),
    comment VARCHAR(255)
);
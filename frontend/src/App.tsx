import axios from "axios";
import { useEffect, useState } from "react";
import diaryService from "./services";
import { Visibility, Weather } from "./types";
import type { DiaryEntry, NewDiaryEntry } from "./types";

const weatherOptions = Object.values(Weather);
const visibilityOptions = Object.values(Visibility);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

const App = () => {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [weather, setWeather] = useState<Weather | "">("");
  const [visibility, setVisibility] = useState<Visibility | "">("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    diaryService.getAll().then((data) => {
      setDiaries(data);
    });
  }, []);

  const addDiary = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!date || !weather || !visibility) {
      setError("Date, weather and visibility are required");
      return;
    }

    const newDiary: NewDiaryEntry = {
      date,
      weather,
      visibility,
      comment,
    };

    diaryService
      .create(newDiary)
      .then((returnedDiary) => {
        setDiaries(diaries.concat(returnedDiary));

        setDate("");
        setWeather("");
        setVisibility("");
        setComment("");
        setError(null);
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error)) {
          const responseData: unknown = error.response?.data;

          if (
            typeof responseData === "object" &&
            responseData !== null &&
            "error" in responseData &&
            typeof responseData.error === "string"
          ) {
            setError(responseData.error);
            return;
          }
        }

        setError("Failed to create diary entry");
      });
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Personal aviation logbook</p>
        <h1>Flight Diaries</h1>
        <p className="hero-text">
          Record the weather, visibility, and memorable moments from every
          flight.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">New log entry</p>
            <h2>Add a flight</h2>
          </div>
        </div>

        {error && <div className="error-message">Error: {error}</div>}

        <form className="diary-form" onSubmit={addDiary}>
          <label className="form-field">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <fieldset className="form-field">
            <legend>Weather</legend>
            <div className="option-group">
              {weatherOptions.map((option) => (
                <label
                  className={`option-pill ${weather === option ? "selected" : ""}`}
                  key={option}
                >
                  <input
                    type="radio"
                    name="weather"
                    value={option}
                    checked={weather === option}
                    onChange={() => setWeather(option)}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-field">
            <legend>Visibility</legend>
            <div className="option-group">
              {visibilityOptions.map((option) => (
                <label
                  className={`option-pill ${
                    visibility === option ? "selected" : ""
                  }`}
                  key={option}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option}
                    checked={visibility === option}
                    onChange={() => setVisibility(option)}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="form-field">
            <span>Comment</span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What made this flight memorable?"
              rows={4}
            />
          </label>

          <button className="submit-button" type="submit">
            Add diary entry
          </button>
        </form>
      </section>

      <section className="entries-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Flight history</p>
            <h2>Diary entries</h2>
          </div>

          <span className="entry-count">
            {diaries.length} {diaries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="entries-grid">
          {diaries.map((diary) => (
            <article className="diary-card" key={diary.id}>
              <div className="card-header">
                <h3>{formatDate(diary.date)}</h3>
                <span className="flight-badge">Flight #{diary.id}</span>
              </div>

              <dl className="flight-details">
                <div>
                  <dt>Weather</dt>
                  <dd>{diary.weather}</dd>
                </div>

                <div>
                  <dt>Visibility</dt>
                  <dd>{diary.visibility}</dd>
                </div>
              </dl>

              {diary.comment && (
                <p className="diary-comment">{diary.comment}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default App;

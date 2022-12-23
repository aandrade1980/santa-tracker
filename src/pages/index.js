import Head from 'next/head';

import useSWR from 'swr';

import Layout from '@components/Layout';
import Section from '@components/Section';
import Container from '@components/Container';
import Map from '@components/Map';

import styles from '@styles/Home.module.scss';
import { useEffect, useState } from 'react';

const DEFAULT_CENTER = [0, 0];

const fetcher = url => fetch(url).then(res => res.json());

export default function Home() {
  const { data } = useSWR(
    'https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b',
    fetcher
  );

  const [currentDate, setCurrentDate] = useState(new Date(Date.now()));

  // const currentDate = new Date(Date.now());
  const currentYear = currentDate.getFullYear();

  const destinations = data?.destinations.map(destination => {
    const { arrival, departure } = destination;

    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    arrivalDate.setFullYear(currentYear);
    departureDate.setFullYear(currentYear);

    const santaWasHere = currentDate.getTime() - departureDate.getTime() > 0;
    const santaIsHere =
      currentDate.getTime() - arrivalDate.getTime() > 0 && !santaWasHere;

    return {
      ...destination,
      arrival: arrivalDate.getTime(),
      departure: departureDate.getTime(),
      santaWasHere,
      santaIsHere
    };
  });

  useEffect(() => {
    setInterval(() => {
      setCurrentDate(new Date(Date.now()));
    }, 30000);

    return clearInterval();
  });

  return (
    <Layout>
      <Head>
        <title>Santa Tracker</title>
        <meta
          name="description"
          content="Santa Tracker, create mapping apps with Next.js Leaflet Starter"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          <h1 className={styles.title}>Santa Tracker</h1>

          <Map
            className={styles.homeMap}
            width="800"
            height="400"
            center={DEFAULT_CENTER}
            zoom={2}
          >
            {({ TileLayer, Marker, Popup }, Leaflet) => (
              <>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {destinations?.map(
                  ({
                    arrival,
                    departure,
                    id,
                    location,
                    city,
                    region,
                    santaIsHere,
                    santaWasHere
                  }) => {
                    let iconUrl = '/images/tree-marker-icon.png';
                    let iconRetinaUrl = '/images/tree-marker-icon-2x.png';

                    const arrivalDate = new Date(arrival);
                    const arrivalHours = arrivalDate.getHours();
                    const arrivalMinutes = arrivalDate.getMinutes();
                    const arrivalTime = `${arrivalHours}:${arrivalMinutes}`;

                    const departureDate = new Date(departure);
                    const departureHours = departureDate.getHours();
                    const departureMinutes = departureDate.getMinutes();
                    const departureTime = `${departureHours}:${departureMinutes}`;

                    let className = '';

                    if (santaIsHere) {
                      iconUrl = '/images/santa-marker-icon.png';
                      iconRetinaUrl = '/images/santa-marker-icon-2x.png';
                      className = `${className} ${styles.iconSantaIsHere}`;
                    }

                    if (santaWasHere) {
                      iconUrl = '/images/gift-marker-icon.png';
                      iconRetinaUrl = '/images/gift-marker-icon-2x.png';
                    }

                    return (
                      <Marker
                        key={id}
                        position={[location.lat, location.lng]}
                        icon={Leaflet.icon({
                          iconUrl,
                          iconRetinaUrl,
                          iconSize: [41, 41],
                          className
                        })}
                      >
                        <Popup>
                          <strong>Location:</strong> {city}, {region}
                          <br />
                          <strong>
                            Arrival:
                          </strong> {arrivalDate.toDateString()} @ {arrivalTime}
                          <br />
                          <strong>Departure:</strong>{' '}
                          {arrivalDate.toDateString()} @ {departureTime}
                        </Popup>
                      </Marker>
                    );
                  }
                )}
              </>
            )}
          </Map>
        </Container>
      </Section>
    </Layout>
  );
}

import Image from "next/image";
import Zoom from "react-medium-image-zoom";

export function Gallery() {
  const images = [
    21, 29, 13, 8, 16, 1, 25, 9, 17, 3, 26, 11, 19, 6, 24, 14, 7, 22, 2, 27, 15,
    5, 20, 12, 28, 18, 10, 23, 4,
  ];

  return (
    <section className="max-w-6xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
          Some of the Sample Outputs
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="aspect-[1/1] w-full relative">
              <Zoom
                zoomImg={{
                  src: `/images/${image}.png`,
                  alt: `ad ${image}`,
                  width: 800,
                  height: 600,
                }}
                zoomMargin={40}
                classDialog="custom-zoom"
              >
                <Image
                  src={`/images/${image}.png`}
                  alt={`ad ${image}`}
                  width={400}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </Zoom>
              <div className="absolute pointer-events-none inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

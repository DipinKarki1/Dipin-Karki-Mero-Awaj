const About = () => {
  return (
    <div className="min-h-screen bg-[#1D0515] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-white">About Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 items-center">
          <div className="lg:col-span-4 bg-[#2b0f12]/80 backdrop-blur border border-[#4a1b1b] rounded-2xl p-8 shadow-2xl">
            <p className="mb-6 leading-relaxed text-gray-200 text-lg text-justify">
              Welcome to <span className="font-semibold text-white text-xl">Mero Awaj</span>, your
              trusted platform for reporting and resolving community issues. Our
              goal is to empower citizens by offering a seamless and transparent
              way to highlight concerns and contribute to meaningful solutions.
            </p>
            <p className="mb-6 leading-relaxed text-gray-200 text-lg text-justify">
              We are committed to fostering safer, cleaner, and more vibrant
              communities through collaboration and innovation. By bridging the
              gap between citizens and authorities, we ensure that every issue
              gets the attention it deserves.
            </p>
            <p className="mb-6 leading-relaxed text-gray-200 text-lg text-justify">
              Whether you&apos;re reporting a road hazard, waste management issue,
              or any other community concern, Mero Awaj is here to make the
              process simple and effective. Your voice matters, and together, we
              can drive positive change.
            </p>
            <div className="mt-8 p-6 bg-[#350616] rounded-xl border border-[#550816]">
              <p className="font-medium text-lg">
                Thank you for being a part of our journey.
                <br />
                <span className="italic opacity-80 mt-4 block">Sincerely,</span>
                <span className="font-bold text-[#9A0D1B] text-xl">The Mero Awaj Team</span>
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <img
              className="w-full h-auto object-contain rounded-2xl shadow-2xl border border-[#4a1b1b]"
              src="/about-us.jpg"
              alt="About us"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800";
              }}
            />
            <div className="mt-8 text-center">
               <div className="inline-block p-4 bg-gradient-to-r from-[#9A0D1B] to-[#350616] rounded-full shadow-lg">
                  <span className="text-2xl font-bold">1,000+ Issues Resolved</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

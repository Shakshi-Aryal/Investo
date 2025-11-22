import { useNavigate } from "react-router-dom";

const programs = [
  {
    title: "Weight Loss Program",
    desc: "Burn fat, stay strong. A science-backed approach to shed extra weight while preserving muscle.",
    img: "https://cdn.pixabay.com/photo/2023/01/08/12/50/weight-loss-7705107_640.jpg"
  },
  {
    title: "Muscle Building Program",
    desc: "Bulk up with precision. Build lean muscle through advanced resistance training.",
    img: "https://cdn.shopify.com/s/files/1/0291/3743/6771/files/how-to-gain-muscles-image_1.png?v=1713348438"
  },
  {
    title: "Beginner Fitness Bootcamp",
    desc: "New to fitness? We’ve got your back. Build habits, form, and confidence.",
    img: "https://miro.medium.com/v2/resize:fit:926/1*MTgiKuTJlMntXKIlUVA4FQ.jpeg"
  },
  {
    title: "Home Workout Program",
    desc: "No gym? No problem. Get fit anywhere with minimal equipment.",
    img: "https://media.istockphoto.com/id/1299770398/photo/man-training-and-stretching-arm-at-home.jpg?s=612x612&w=0&k=20&c=goPriACyo0KaZezIp0fSUcFf5Zx1625gU1408MzHjvw="
  },
  {
    title: "Athletic Performance Program",
    desc: "For athletes and pros. Train for agility, speed, and power.",
    img: "https://sfhealthtech.com/cdn/shop/articles/african-american-male-athlete-2023-11-27-05-07-53-utc.jpg?v=1718872124"
  },
  {
    title: "Flexibility & Mobility Program",
    desc: "Feel free in your body. Unlock your joints and move better every day.",
    img: "https://hips.hearstapps.com/hmg-prod/images/home-workout-lead-1584370797.jpg?crop=0.7502222222222221xw:1xh;center,top&resize=1200:*"
  }
];

const Programs = () => {

  const navigate = useNavigate();

  return (
    <div className="mt-20 px-6 text-white cursor-pointer" id="programs" onClick={()=>navigate('/register')}>
      <h2 className="text-4xl font-bold text-center mb-2">Our Programs</h2>
      <p className="text-center text-sm text-gray-400 uppercase mb-10">Find the program that fits your goals</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {programs.map((item, index) => (
          <div key={index} className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform duration-300">
            <img src={item.img} alt={item.title} className="h-40 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Programs;
function Card({ name, img, tel, email }) {
  return (
    <div>
      <h2>{name}</h2>
      <img src={img} alt="avatar_img" />
      <p>{tel}</p>
      <p>{email}</p>
    </div>
  );
}

export default Card;
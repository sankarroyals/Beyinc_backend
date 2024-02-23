exports.allColleges = async (req, res, next) => {
  try {
    console.log(
      "http://universities.hipolabs.com/search" +
        (req.query.name ? new URLSearchParams({ name: req.query.name }) : "")
    );
    const result = await fetch(
      "http://universities.hipolabs.com/search" +
        (req.query.name
          ? "?" + new URLSearchParams({ name: req.query.name })
          : ""),
      {
        method: "GET",
      }
    );
    const data = await result.json();
    return res.status(200).json({ college: data });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
};

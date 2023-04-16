const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  const { id } = req.params;
  try {
    const storedUrl = await prisma.url.findUnique({
      where: {
        shortenedId: id
      }
    })
    if (storedUrl) {
      await prisma.url.update({
        where: {
          id: storedUrl.id
        },
        data: {
          clickCount: {
            increment: 1
          }
        }
      })
      res.redirect(storedUrl.originalUrl);
      return
    } else {
      res.status(404).json({ message: "That URL shortcode was not found" })
    }
  } catch (err) {
    console.log({ err });
    res.status(500).json({ message: "testing" })
  }
}
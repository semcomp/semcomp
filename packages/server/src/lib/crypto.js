const crypto = require("crypto");

const algorithm = "aes-256-ctr";
const secretKey = "88786a73c502b7d6392e2b230928a977";

module.exports.encrypt = function (text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return `${iv.toString("hex")}.${encrypted.toString("hex")}`;
};

module.exports.decrypt = function (hash) {
  const [iv, content] = hash.split(".");
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

import avro from 'avro-js';

export const topicType = avro.parse<number>({ type: "int" });

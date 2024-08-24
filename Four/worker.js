// export default function worker(patchConnection) {
//   patchConnection.addStatusListener((status) => {
//     console.log(status);
//   });
//   patchConnection.requestStatusUpdate();

//   function arraysAreEqual(arr1, arr2) {
//     if (arr1.length !== arr2.length) {
//       return false;
//     }

//     for (let i = 0; i < arr1.length; i++) {
//       if (arr1[i] !== arr2[i]) {
//         return false;
//       }
//     }

//     return true;
//   }

//   let currentWavetable = [];

//   patchConnection.addStoredStateValueListener(({ key, value }) => {
//     if (key === "wavetableIn" && !arraysAreEqual(currentWavetable, value)) {
//       currentWavetable = value;
//       patchConnection.sendEventOrValue(key, value);
//     }
//   });

//   setInterval(
//     () => patchConnection.requestStoredStateValue("wavetableIn"),
//     1000
//   );
// }

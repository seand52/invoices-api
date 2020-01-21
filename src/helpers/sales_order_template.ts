import { BusinessInfo } from 'src/business-info/business-info.entity';
import { Clients } from 'src/clients/clients.entity';
import { Products } from 'src/products/products.entity';

interface Totals {
  productsTotal: number;
  tax: number;
  re: number;
  subTotal: number;
  transport: number;
  invoiceTotal: number;
}

interface InvoiceProducts extends Products {
  quantity: number;
  discount: number;
  finalPrice: number;
}
interface Data {
  products: InvoiceProducts[];
  client: Clients;
  businessInfo: BusinessInfo;
  totals: Totals;
  invoiceData: {
    date: string;
    expirationDate: string | null;
    id: string;
  };
}

const currencyFormatEs = num => {
  return (
    num
      .toFixed(2) // always two decimal digits
      .replace('.', ',') // replace decimal point character with ,
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ' €'
  ); // use . as a separator
};

function round(num: number) {
  return Math.round(num * 100) / 100;
}

const makeProductsBody = (products: InvoiceProducts[]) => {
  const body = [
    // Table Header
    [
      {
        text: 'Referencia',
        style: ['itemsHeader', 'center'],
        fontSize: 10,
      },
      {
        text: 'Descripción',
        style: ['itemsHeader', 'center'],
        fontSize: 10,
      },
      {
        text: 'Cantidad',
        style: ['itemsHeader', 'center'],
        fontSize: 10,
      },
      {
        text: 'Precio Unidad',
        style: ['itemsHeader', 'center'],
        fontSize: 10,
      },
      {
        text: '% Descuento',
        style: ['itemsHeader', 'center'],
        fontSize: 10,
      },
      {
        text: 'Total',
        style: ['itemsHeader', 'center'],
        fontSize: 10,
      },
    ],
  ];

  products.forEach(product => {
    body.push([
      {
        text: product.reference,
        style: ['itemSubTitle'],
        fontSize: 9,
        // @ts-ignore
        margin: [0, 5, 0, 0],
      },
      {
        text: product.description,
        style: ['itemSubTitle'],
        fontSize: 9,
        // @ts-ignore
        margin: [0, 5, 0, 0],
      },
      {
        // @ts-ignore
        text: product.quantity,
        style: ['itemNumber'],
        fontSize: 9,
        margin: [0, 5, 0, 0],
      },
      {
        text: currencyFormatEs(product.price),
        style: ['itemNumber'],
        fontSize: 9,
        // @ts-ignore
        margin: [0, 5, 0, 0],
      },
      {
        text: `${round(product.discount * 100).toFixed(2)}%`,
        style: ['itemNumber'],
        fontSize: 9,
        // @ts-ignore
        margin: [0, 5, 0, 0],
      },
      {
        text: currencyFormatEs(product.finalPrice),
        style: ['itemNumber'],
        fontSize: 9,
        // @ts-ignore
        margin: [0, 5, 0, 0],
      },
    ]);
  });
  return body;
};

const makeDates = invoiceData => {
  const data = [
    {
      columns: [
        {
          text: [{ text: 'Fecha de emisión: ', bold: true }, invoiceData.date],
          style: 'invoiceSubTitle',
          // width: '100',
          margin: [30, 5, 90, 0],
        },
      ],
    },
  ];
  if (invoiceData.expirationDate) {
    data.push({
      columns: [
        {
          text: [
            { text: 'Fecha de expiración: ', bold: true },
            invoiceData.expirationDate,
          ],
          style: 'invoiceSubTitle',
          //   width: '*',
          margin: [30, 5, 78, 0],
        },
      ],
    });
  }
  return data;
};

export const generateSalesOrderTemplate = (data: Data) => {
  return {
    pageMargins: [40, 80, 40, 60],
    header: {
      margin: [0, 0, 0, 200],
      columns: [
        {
          image:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAABYCAYAAAErTO1dAAAAAXNSR0IArs4c6QAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKO2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHBob3Rvc2hvcDpJQ0NQcm9maWxlPnNSR0IgSUVDNjE5NjYtMi4xPC9waG90b3Nob3A6SUNDUHJvZmlsZT4KICAgICAgICAgPHBob3Rvc2hvcDpDb2xvck1vZGU+MzwvcGhvdG9zaG9wOkNvbG9yTW9kZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjIwMDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjE8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjIwMDA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE5LTA4LTEyVDE0OjAxOjMwKzAyOjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxOS0wOC0xMlQxNDowMTozMCswMjowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE5LTA4LTEyVDE0OjAxOjMwKzAyOjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wTU06SGlzdG9yeT4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOS0wOC0xMlQxNDowMTozMCswMjowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDplYWQyOTRiYy0wZGY1LTQzYWYtYWYwYi0yZDQ0OGExNzEzNzY8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+Y3JlYXRlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChNYWNpbnRvc2gpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICAgICA8c3RFdnQ6Y2hhbmdlZD4vPC9zdEV2dDpjaGFuZ2VkPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE5LTA4LTEyVDE0OjAxOjMwKzAyOjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOjVjYmU4MGM3LWJhMGQtNGM3YS1hOWVkLTU0MWM5OGUzYmZiMTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L3htcE1NOkhpc3Rvcnk+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6NWNiZTgwYzctYmEwZC00YzdhLWE5ZWQtNTQxYzk4ZTNiZmIxPC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06T3JpZ2luYWxEb2N1bWVudElEPnhtcC5kaWQ6ZWFkMjk0YmMtMGRmNS00M2FmLWFmMGItMmQ0NDhhMTcxMzc2PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo0ZWJhYjI0NC1mZDg3LTExN2MtYWUwMi1jYWE5N2VlY2RkMjg8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpb2ky6AAAlkElEQVR4Ae2dCbilRXWuEZILogIqikDTDc2MAwoqk0yhBYJK0BuDzDIKcgU0SpRREHFAxQGjYkQBURyDmmCIEkBAFAUFUeZJARVFDYrIzU2837t3vadX/733OadPTwx7Pc/316pVq1atWrWq/tp7n4Yllpg6PXvqXYf3vDFNfw6WHK4ytZb/m27/3boywMbjmfmL8Ro7bRiD3hHAP47KgiCMrR78vwB+qeB/gnmm36cHHQGGCAWEYQjZlgEDzBNpkLhi5L9aiRF4CPlVPW6cx9prr717bd4vFTpWYk1ODW5vQjIEdL2udWx07fSmfVgzQuM9jd8pJYMQHjvt0dosDBn17yscVO4VIUYIzW+C17W6hjXEtO8OnhB8pelcmPLpwRgxzf/VasR8leCIgIXFICDtKN/bylkpWYO/bHVmpu7zwz+8iEXTuwXqGUYJwZPaAPNtfMVmiPUw/+fbKAYwtnaAxxDlpj1uHh7uwLr7yOezAgzCzzPRsQIDDzXZgylPCyZjmDQeIwx2yRzdpTQgG4/YYGP0nnDVsF6zYdgg7DoWzt3XPau/nTaI3TiHtz1pe2jUnEWsTN6Z7F3aqs5SWEfg9mQaeuiUjotsepPv2soUPe83gmlEv1833r62LdSSCZC2lBOt00J1ZCLjhp7yA03Ztb9nos6Lut2I1i3lBKpsUfs113grRaJjN7RW65QfDIwy9eWazkIrujlYrwIMihP1ZKRORNcIIOqiJ1iYD49qB+yWpMEZAVGE/1kAVb1D+6Il3tzk57f6Ai08qq5ug+AAZHRZYmVspie3ukfRNa2Ozp8CqLtSfenknh7MvXKttdbauduNM5VlZcClW+PMlNsFjw8cnPanBF3aKgKcf27AJN8foAt+FIxH9EOvS4yJXYM2RzvLi3OD6P4IMXhBK7+ekpmTPkySyf5TgM5eATJzfN0m/1xKiMF59VUH4XHaVcSXvw14wWPHYIWdTS7BbEmfw5hAAj8j+FXAwDrm6kTU02EwJnJ9q9OPgU9sdfopsy/1HzR5irEVHxhhjD0Y4IQRwsDyQe1AFBi0TnBQikRlDsJWpctKRVvYhpjo1j1u9tuz+tCaFl3h4G9ZdENOfSSc5cOUebzR1E0tup5sKlKE1HvY09/HQ5wVOkz+vrzJlT0sSk4PnaVkg0H3BaaJsl7D4nyQv9XZ76ROZI8JdJZ2N2XYxUtETofJ4+nNnSrbdfG6OOfo1WE33G5RcRPiOETUjw2oezaHXfTEC8JoUnJHsU5KHBmgc0dgiiySfO5GpeakDpK/UH0to/fFAGeJOl+NLnRaNSPglBGC52JD/cPBza3ON0E/C5xA2CX2C+oEkHUnj2yBEcZ1YKKSQdVh2f8u4ELE5JBD2PtdYB3ZlGnglS/WWMpK1L3cVJ6vF3FkenBI8ECA43sHnw1wnmgjYzVonzLlA8CaSy211DMGGVg9QiPHgGd0lJjo4U2HW97tjed+8cLG/7GVx6WcXzJYQ+0QEfMQZ6hPRE7wrCiu0JTrCsLX+jB7w3TYP6TaUDo+LVWBXNwieF7pgZN8W92NACcFr+//CTxd0CXqtwTwgwhd2gjWMDo4Dd3xxnTpzKB3B+SghNxB3WAM9nYVUr6k6eyf8qjG04fVIop8KukSNu4MrguIqI4hJ2D/GXDuDyU6Q3bs1/pPJsKmwglKjF7S6nw1gGNEChwfoPfbAFvwQLsfLDLkkPrPDE9QWJ0Tmnzoq1+D0ZuD6qB8F4vxLZsGxnGSKCKvDsjf3mnzukrfLwdLt3bs7BcQbfsaJH3bPW1zEEtRCUWOMzoCIokxDf574z+a8rzGr9FKVgUiTWofThcI2ak9bokl/OKaNyVB0enTw6P3rMDAhZ1N64bdNGDJIQdjcDoyIZf/4+EhnbFEhnEiiOzYADJaZ4fHxp4B7Xu3OhGm7tjwEKWT56U0F50TCYMJOlwcDKKtmpBBlg26K+SxpRxbXwhc4rBDTwl0Ph9gW6c3CP+oJ1YT2jbglwMmD1hxNrQrGnZEU4kA7z4C6hYxuyjdklOx+5jvQ+Y+LSCQHpLwgIvETcEg8pigzaNikN5Ilgjwma5mrgGm3CYwmAZymci+F9DuonBJUi/siIiAL6UaKINrwNXzjL4hAnR8O/tmf2Jk6tBnRIkAGUc2GtRueUSLEoFjMWg38OryErwqGNGACBC4lQODZeldkS5+jqGNM1kdSoMddix7R1lMNBqRwXwgrUGTP1qllD8NDLrtBhcbfIqAuMqRzeioz0X+MXvF86Vl0CgNXNge8Tmytsvf3trN8GuanmdztfOIzmpfVMx3/+D7gW92g0F5X8Dn3u0CqL7xaTcw8K8OIOxVGwbtNb3W/uOtTceMRZ/x+Q4JekQHtz+FJZa4NgwT841egzIRT9DuDggwZ6zfoa4S3mAZ/Csjk/hpn3aDXvk3NiVeoBLHyPpWHmklk5tscCfS27xNnoz0pcaXdk9t8oNSMh7t2DJzbwpvAPn+4iMBeuBPrSSrlwvqrkt1kZJjW044OOcoLxYmOuhoMMPuTPuLgi4RPAKF3o9bI1/GGJwZTfbVJvOLeNqPbG0E7ZzWjhxbjkv94ADCV8/9nmBxPdZcc80d88fuJ+ZXix0m6wMTAZ55l7T6J5uBeuY20RxFnfihrWWLlNr9XPi1gicEpxS57ZR8bf0PwSqBpD/WF3VJpj45+I/gluDGgHksFUiVVzawdLIeAy8oWgSQwTAmalCL6hg7mW3kwh2YXncE+HB2oDzsGP+M8HsEBwS7Bc8LoIn86GvN/dwsIn76giZj4/jo4R/vFI+2sPNGBpkS2jr4l6DKORO5VSBzMeD55GZQ1eccvqjJaSNwNXipjpF9LGkgg1cPkNVj4+2pV6J9smTG3dw6ON5ENlwESoAd/FMedmK6JCoPBgzG7aJ+mU1gusYY5DlBDTR9ybbq+IzUnRhyMsAzP+wY1T7w0McDg0vpLwLaQwea3i/met4diXavL63aX620I1shIHDQHQHvmX8PJHTI4kH+qzOwJHjrlpbuBErTHCxXqFcHDuhkuDEYGCcTUY/UsUTI+IypzOvdtCJzISMaI/Up8WHHwF1CeXLwtcC+lDMD9GnH/3OC6uvSqb88qLbtH/GYvMqQS+5k61MuXYSLY6EbYH40+7eAbMURAib9IgzyOgHbuI3UtpVS/0pgABhnp4AsY/yPBLZhj77cswkeOv8nOCk4MKh6nMHefMLO4Qt2+AqVsi4w/U8LIH1nbu6qXkN70D6UWAHupazuIMJ5aM2ACZttDsrVD6L/PkENGPJf8wipb4ns5oCJGAx8IaPWDtSjZOLIXxFwnK0c2E7fYwM+rBwd8DIz4OpYYt+MU1ZLbEDKsP3xnmS2zDbELCqEbFxiy14ZYPDegK23TfCe4A8BBgwcQXaQTcJDOt2v9Z/o8OJ7oAjJwg0D+1NWcjGr7GOpqP/L8AQBPWzhp36hwxlKuxNHb5/gwYC5XRJI+FwXSl+wKyHTfpUhJw6XBRcFZwXzRD+NNkYqMIih1QMIB1mYyRATRn8QYWOydgb178pqgLpt+jBsvPHkLmq1yU57XhOMN27t08uMOQSPkgoB4gwlEHsGM4KbghEtgAjUzDwz9tyZ3PPhR7QAIsDxQBbfGRBUz1beE76Iw45oqhEguNClAQGutyGCfV4wovmMAFm8aVAzGF4cEN4XYdgRTTUCF6Wjn8wMruWMtHU/E3CGuwOmOuZjpp/XKQLK3djAUnrHJxg1oPJPjPzsAN3TA+/bYUdUI0CG8kUPgepmMi89PlxB3j4M5P6RuSB8eIEf0ZAIELRZgQGrJZnMLzOSGcxHcvTMfBbjfpVG5dwRIEOPCWpwK88HkvrS27npGmCDfXnkIxonAvzMVYNG4Dw6VgxPtntMkN3eoetivCnyEY0Tge+mjS1fg2bQ6eYx8d6m4wKg7516WngXIuyIuhG4OYJBQb6uKXp9I6hdPeq8+CBvKv3a6DlHBO5Kzcyt2Xx00Xp9eNpqFqv71qJXz+8iHrE/SwhqkA3kmpEv28LDVa7q1KwmgzkqPFZmhr8+cFHCjojjogbQFxuRIXBbBQTM89fgUb4vgDxS9gqPHHi0hB3RFQmBASE4BNzzmOh8L6gBRoeFQA96fL/o/Xtp2wwyfw7xmCfO0HOCGmQC9IaAY+BJQQ0cvFm/S3ipe3/2yDlBhUdDSbA8E4fNh3PTj8fqIOOO6xFhxq7UFN6dksAK27/U2inWa+3aqAtBO2M84sngrp2ZnBHw465BsSQA/Lx/fMDf1kEEnABsEahnRkfUIz58KDM7+YEWItOxxUvR/pQG+9DwUHdh+9JH0JOJQh8KnCiTJOMMinLqyN3uyFkgbhDq0P6vAWTwzV4Cjt7qgXRbGGSOpe6VTcEsfkRf7QjSM9tEa/AM2kSlwal6L20BuiilQdP2Dq2N4ocB/dSxZCdx28C3Gty1UjfoYR85xCSODWqQpsqbqQSHHYIddoUBPiQ8xPa/OqDdPupwJPGylDYKc2FQfVo19UfUEUJATgoIRp3IVHjO3nsCaN8AGwbvRIQhzuAbAtoIcB33balLs8LcGaDHbvE755PDQzXD+5KH8ZPtt2dgRg0LrsEa1q78XW2uN6X0r/s576EZwa8CdKu981M3ewnurU0Hn6reQalDi/3IyF/7H7bOOusc2Hdn4qfbjolzJnbPWOrK+K+HcFZWem4q9FWH65h3Y+RnBNCLA/UYB/6qYFoA7Rr8PEBOO8HV5uXhVwwgdt5ip4033vgv808qXsZ/DXb99ddfebIOuW3dyjXgtPE3dRCTdGF6gvbgmCBA0CsD+FOohI4PqItLw+vYO4ucI0E/0OWTJGcyxPEwaNxe40J+1J1TF/lx+Tcsz0qg+aV+QqIjmcYE689ABmWNZsHrXqsOLci6ma3VG8RtqR/YZNukvDbQviX35XMDfJEI7mTHtc/CKI+PUV7Ktwaf6QyAj2BS5GTdztRf3npO2kgZiT4eB1uFx0nHIKCXBW8JuEJWInMIbDdzkZEQotuepnki7ExmAdH75wCfeU8QH943lwTzFBcm9qbAFw1ZfX0AMQjEpHBKDBqgTrz2G6SLTeSc89w6zgs8LsKOUe27daQHBPsFOwX8WcFUiPlCbwg273GTe5gk+Pmn4LtBnfOkrGiE8sCgu9JPjow/Yf2rYMtgRlCJgGwQaOes2jgBTx+c94WnOpNYKeAfbKJDNmn/gsYfltJFDTspOipa2CGxsLlZ0J1vRANpuUj3DeqHq4GKXSFO7h8wIJP9UrBa8ObAN7+T+11kOFePFvpBBPqyoAYDOUQGMQ46lZgcGaU9xufGYeC+HZ6xWQDHXT48hM53grcFZmjYCYnbzeMDfcXflwSOGXYu0m90WHzK8fTnMuAqOhkmalC/GP6Fc/XoC25KYXAIwCVBvcYh4yjSmePCk3mrBF1yPEvbqWNH+YmtgYlKtHWpttNmkOB5R0DItFtt6C86xgb+68GvgqOpzCuRBcsEdcCjihEGqoOVpjn6sDgfDrBD5gHOL4j+3wx4caDH4uweMCHGf21gMCkPDCBt6Rv380FZS2bWQMrbj/LZAePxMpsZQPiHn/hzXyAdEoa2O4OdA94fWwb6zjy4HNQFSXU4EYCNAxz5eGDHQZNJ8xgxEa5tdSLwfx3gjPKwY6TMcqwhjDJL2uQt14iMCUM/DZRTVjKTazs+/V1wePAPwbLBq4Lq61NSh+4OHgpcAO1Xe8rQnzRNa5oEWScn07kOzOqfECgjK48IWDAW8/LAM5u2vw9czJtLG/1XDeok4XnhEGTw+oDxHItS0v/aRn/qKwd3qthkyPELHyDqNfj03TTg+HTHIeMyUHe5CRrxcHKbDdeY3aJxHKpnMy/HDwY6QztEMNcKqFek2mv7m5QuAFn0+eDkAB597H0hYFzAEVHtEJRdgjpR2ncLur4gl3i5679yyusCSoBfPwggZQT5/p5k9oM5HjS7Ov8cCzItYFCdJCCebTpDSXA599W3jcm/rrURuCq/O3VImWVf2n8qq2W3nbrtjPeZVifb2RHbBy4u7SwU+l8N2CnuAGTQN4Oa5U9N3Z1DkA8OuM7WxU51Thq3saliDLoscAKWvFig8wOcwUmch1YLyCx1LWmDrLNYv+hJ5t4VMyJ3x6F/U+AiM94+gf7RDm0ZqIPsvGCvoOohx1eShKBfGUDIAXM4MYCUWfalfb9OSGWLgAUcl142pJUVc4L/GJ5BXFWcoP6cQB2dwOkdg/WCVwZnB/Zj8r8J1g3QNxjoSMgIACC7JPRJCkraHC9sj6hLt4fRzo3hWRwIX/8j0B/64O/VAcS9vbYh41cgdNBl3vWqSnI9P5gwyHTGaYhtzEQMHNvj8sABKHXiU+Eh+ki0i5nh2Z58nH538GBgm05TvyN4UlDt0E6QGGvfAEJXqnYubcLajkgdS/t229hJF7dG5v6RgHHxgbMav77Z6tryZoLeqoG7JOxwsvPxUeHNundQjwcGZCHMYN68EE5VwiGcRB8HNg/qKt+aOmPRzu6o5FmHDB7bBEDfPhAeUk85i3FHcEXQJXTwmxKyL/wtgTbehaAR4+4ekBTspG0CZD8M8Ns+qzc+xVxxQDaQ7EwgzSKMytOOw/sFUDfAfens54Zhz51dnYubNpdkbkENCq01Y1jQAwL9YucsGVRC5wXBvcEnAurDaFDbYVH+WuugLcYjJpRXtbaun008d4ERspjOXXCu7RNIEwVYPWzWwCi37AZF+byUNTjD7Kkz6WAUB5hrna+2XhT5VOwV0yP24RYBFpTFrgu7Qur/O/hkcGvQ3RzHRgbVJOlLRs9RBBZDBGoico84IOA9XBOXe4avU0rb+G4L8pTr10bPUQQWYQQ4feu1gYvlbYFJSsLWS6VyL77XpP3pAVQv0n3J6DmKwCKIQE1i7qV8ZDZROX29qCuzrIl9SvFzdCKXYIzYRReBehIfl2FNVE5bvyZQVktP4z9Eb+vmLrbq3bqJ5yrQIeHRH/ahbq5OI8EoAsMiYELRvm3AN8Mk60RJTIJzWqN7QbB0ANVN0ZfMfpK49Q5OCz9CbRG8J+BbXmh0ovfjMHrOQwRqYp2ZfiQmSVqvDci6qB/yXpN2iE3RPV2RdZN788hOD34ZDLLLzy9Q11ZfOnqOIjAgAn4wWz9tdwcklleGbpLVujo3RH9GAGkLvpvAfH13VOAY2OLuzanOxnFjwG8XQHWT9SWj5ygCAyJAsvkaf3V4E9Urg/VuWU/rdxa7Jh42tUszv/bU05ek7X6AdGPckbbVA6hujL5k9BxFYEAEarKdlnYSliTtJlk3kU06/giVnzMhrw/V5lqR/0tg/0EJ3B3zTIw1cmNYH5WjCAyMgInCyfyNgKTyFW/ydUsSndc/8jMCCVs1iTdL/UeB/cc75d0YfPuxQwBhC79GNIrAhBHwFF0+mtcFJJ1JZQJ2S9sfiO6sACLptEWdJL4xoC+ne72KdO3VjVP/8qjai4kRjSIwPAImy0pRuTMgyUzUbsKZlF47Ph9dv1VYpvDPDM/fWas/XhLX0/3b6TM9gPCrexqzWTj1RdgRjSLQj4CJvHKqdwckXz0hu8lskvP3kH7nS2L5oQw7XlHoO951giR2U9wUnr/Ug0hgryiU8rRBWwYnB58NXhu4mcKO6LEaAZIQ4q/B7wjGS2SSzsT7Unj7Lhse4oeNswOTf7wNQYJr69bw2wQSm0vbymaF4d9W1NMd+24UN1U36e0/Kh/lEXDhl848rw1IQk9dE9JSOX+h/pIA4kohcUqqO14S1zb+qm4TDaRkM0gk9CHBLYF2SWSTt9rhz0sh3zD92uj5mIlAfS3/W2ZNwpiwJg8lCeQ3FZ8J372/Hth07K9utYGsJh//tG71AOIE9npCfZ+gJjD9PMH1x/q30va0ABolcj8OD7snCUOycXICFlwoo0Snm1wRTYqwB50akCQ12UxEk/t3ad8mgBgXmhX4Ywd9ByUxGwFgjxP1hMBx66m+ReSXBI7bTWD7Owa/Kg66W0c8osUVAZKRE2VQQi4X+VoBr+Htg10CXqf8ITuv+W2DjYOZAT8FDyISx+Sr7Z6Er4qQROGkM1FMHBOrfj2GDXzi32DRXpNV/e4pzFViViAxZ4hvTT4c2A8fvEIoo6yb7DupPzeQmN+IFmMESNz6SmRRjwhYKF+fdTHhkZs4tewmYbffL9Lv9OA5gWQiz4jg9wF9PD1JRE/jO8PXxOFD3rmBY3QTj7r+k4DvCPinv5CbleQ7PMAv7aBbNxJy7NQkPit14gRha9AG7TWOHosuAjWJj8mwDwZ1UUmq7sLaPtXSxDDRLssYJNXX29gmb03Ot6at0rGpOH5NMvyt/S5I/fm1Y+N3S/mToNrQH2X6aZ3NtE/rT4HPJDGQDzuiRR2BeprsmcFdMBJpQSevtscrTSTGBiYoP3CsEUi7hLk/wJZJX/WRc3/lutIlrkRXB/pB0pP81rGDrG6Ge1J/c+CJbuJGNEZPDffi4Pjg/OD2gF8fsfvuACLZR7QQIlATmWATdBbVhKK+uGASM/5rA2m9MD8M9BV/qy5/SHRk8MRA4q3DRvUrPvrWBGa+tU47Mv7g6G+C7tVhmci2DfiPY9wYoF/BW80Y8kF030DyXm79sVCSZ8ybcqGRp8SbMoILzKlUF2ZeeRPD5NAeSYfM+jC79EeX9m8EKwYQ92Lup/b7Y+E5/U4JnhFInJJvDO4M7KNP+qKc8r7g7GDHoBLfc28XnBbcEdQ+2OGt8KdAn2nn3n1i8PRAqtc4ZY+Fsrd5Z86cufx666337Pzn5Vdtk37cgsxsThsSZ/3gJ20AEq03eKtPpmARITcGPAl0eXBFcH1wb8AirxTsFLwuYHEZv556nLB8CCRB9gq+EEDof7DH9TeEfT8R2ckB40F8KDw02CN4fACRaMSNpKyEf58NPh9wmkOMPSvgNN4+WD2QiA3+You54IPEdeefA/y5VGFK/aTvY5V68cr/J+Glf/7zn1mTNZdccsnbw//XQw89dNGCCoqLwT2QxSGBWCx40a0jZ2Hqax3ZBQFfy5EMlUhwQMICNgqlibZPePrXU/ac1E28DcPf3HTQ42QlYaYF0r5hvhfQDvCtnpLIuJa8JZgeSKuFIfHx3bu3NhiHTUBM4JVb/iiyE4JnBZWca5U92nmStWLQfHsHZBJ6k+Dwddddd5WUrw5eMUh5KjICD305YJFMUJJD2iTMLwPaWVgSGZ4F5nvYNQKJJMUmE5ss6cNh6UBCvqh0fEN4xro42DuQNgjzqYBko73irtTPDDhZvTNzTdkj+FLACVz1mUedV23j6sKHxH8Mdg3qRki1RxwIzPuxRoPmPGj9B+kNyo9BsnmKqQZ+kF4sIqeZJ/GV4V8V8Acynw5cZE4xXuUSizmv1xL7dktP7UEBQHf/gGS9LDgpmBVwL4bw4/nBW4JvBYMS3TmwIX8eXB6cHnCF2TbgpDYmYccI2V80LKi5jhl/BDLGgHjdFRjXQSXr8Ow2x2Hr2poHB3+scRyGBWJwrgW3BDjGIuto2F5C8KkdekdwfMBJplMk/oIk7JpMBgafBtGyEb45+KsAP+4L+NB1Tyt5m1AHnMYEdRhhi/mvEnCnZyPfFhijsHMRcQL4N8zHbic2BL4yt0VBxJOxuv7ht/Gdqh/MhcPvqODtAWMwN+SuYdjeONR/F6zRyvHiGpV5JwdcLl199RpoSyb80WKaxMdZMJUTmSAO66c/W0bn9cFBwfZB/TaA/oOIRdOvbkkb/bRf+1+aiotqSdLDH9cUsVcJ/yV8Ozz4VvCHQBvDSuJ8ciAN8sm2+Smxy7whTkX86/r0MRpD8+sD/bXB54dPBuZTHfPmyNcNIH3r1xbA08TgJGLXMDC7C+jEzuG7xD2U1/n+wfuDrwfXB78Jal9tWHIvvSu4MOAqsFoA6YdJwt2WPnwg5C3A7tcGyQcZvH5t3p8G87x0xTbjOIbjXdbMdv1DzGaryctnDfpRaoc3xSnBRgGHAMTGuDFA59MBhGxBknPDJvNjbpsFxwR1rvq6d+TQ/PhRE5rxx7NV/esNvCAeLJILdXx4JtpNZhbs9sBkR0fw+iaRuX7sFXCirhesGnBirRhMC94d0Oe/A+xTsvAkt7ZeFV7CFvKaYHWTrN8U8X28wNA2LOntd2F0umPhG7IbAggbLg7f1ug3JXNBl1L+0vDrBBKblPGMNbFh49NvqwDSn35tzidtjF+BbNDcqh38/3Eg8a0BYzo/Y0pSrx5A+giPfeqUg8aKeA75U1JfAWGhaq+IFyzr4mD13IBJMingoiADVwUnBQT+CUGXCCALhk14JtAFbTcG2OvaN7iMA70n0B99MLEvRiGEfRduZniTQ31Kku2s4EkBNGhBro0cXX2A179bwtc4fajoqoO+viHjGxSIsegr8BXeE/rC8Fxntgkg59KvzX4q3ywivjn6dPBPwbHBrEAiHkC6IsyDAZ8FpDeGwV9P5Mq/tinhI3aMFes6PWADLh1ItR3ZaQH2uvhJZH5At09EC458nT8tJhmsOnBb6u8LNg0quTgEd16dcrz3pm8NYB3XhNgiOm4uZbXPgc0pbLrQ2zW7VZ8+njy8QTg1IHx30Z8c3k1Qk9PEvintLC7kYtVEYAzHvDf8TBRDJKy+8V36AcEZwVeCLwcfCXYNJHWtW1ZfSWDGI0EZU1BHTsykU8Mg26EJ8AH6aoC8zkH+JBRCJv/y4S8I0B8G4g7hv3lk7Ogjf0t4N8K85k66DicDNysqLCTB3Snonrg1WdI8X2QyuyAmQA2SybRtRro6qMEwKTnJpjdPSEgTjUWr+trVJsns/Aim/bYe0s8FvjTtEImnfX2hrn30+eADefK6aNdFhu6wJLyCTiE3WL/W33SulW8qExd7wlhe0jr+dWtjXSFjz8a9L6h+wzvXI8NL24TRLm83x7K0jXWC1giU1fgou6inNfccm3j+C4ONJSbMAlcZ8vkl7Lm4LwtvMOqEkRnQK8OvFPy+6arnDr8qckg/3e3aNniOY7LdlT7L9Hr2Hy7wsNNWfw5ufbh3YrNrX703ND3nqv3ntH70dS765py+2/o6J6rwbrijwtNn/4D5w9sXXh/eGR5irsg3oBLyVOb6g7w7B+t8FoD2DtAbpKvcMd9Oh9BWAW3Gu6v3UZRCxqVfm/100yLpburZWouRq46fHD+c4LAJc+pMD9Zouiw+oJ/B+2x4iIXW/rTwvwrQc2G6Y92RNvUtGeuBAN3qk2Nxl4bWCbSnP9RNqHvCe+qzEDUpv9H6alM7tf/3owPVfvp4WOToemqaqNVf57x19A5t+qenhIgTgD4RYKv6oh1OX/R2azronRGc1erOFTkxMA5eRXccoFfHemvaIefVr/WfHgCHpMo467XGxZ7UOFAdfk3qfwzqxOANiq+wGyKbHkDbBbTXALoAnKSQ97oZ4W8Jzg9cGO1TKiPZlwsqDUo0/bkvijOb8sYpsVUXkbo+ndv0TBrnf1TrZ1/KCufnpiGZgf1NzLdFJvFax4Z9TSquX8Tt3ta+bkpIW5S3B7UvvBvhM+Ff0dqRfyeA3hRQd67wxvQ/w/MWhTYJaht87ccdHtIfeOZqzF4fHv0XBpAJ3q9N8lmP90l2mUsNGzpFI0lwZlAnZACQsQAmDXVf0WF7tGae6rtYBv3spkMxI/htsEPACYEt9eCFC89VBFom6CYy47lgJNfTA4h5sUHZMNjTL3j1uc9CLJSL9crw6NwYrBL8pNVrf/k70ubi2Z+Y0P/oAFq6X/Q+OCJ3nsbnrsg+FdD2iQDCd9d3w/C0oW8f65Rc65wPVxkPCzZFdyz7/yFtKwfQ8oEbyXlh19hfhlKIWEL6Bf+xAN3NqYSMRb82yacGD4o+xgA8RCAGEc7Q1m1nZ3460HlsERwnTp2gWP9j+DcGkotoeUwatEFpgH7eOvAqIpFf2uoUXwsch1LY95rIOGms44M8uizG7oFEfAz+C8Ojg75zcJG/EBnEJoH2CNC9IHA+2zdZHU87xGztQDolDP33bAJi7Vo9r7XZFz1Q475+6lDtt13qXT37Uj7U2q9M6cbxrn1iazPZ0Xcem4WX3heGNuOifX19QVPULhuANzJ6+jylRMauCXlqM+iEnkXjOPSMtO0afC6oP6QwwZqw1GsAcPqrwUaB5GJbp3ThNgxPHxaKgBjAb4W/PXhxABEAXlnQysH9Af149eJP9YPEmxm8Itg32DvYPKh+GJeIx0ifzooE2/iD7Qdb/Z0ppwUXBYzrJsMvF2iv8PSti218SGCIZGKTrUMlVP2SPyLyYXY+3Os1e22rDTfJAxEaF0r9+WLrS+F8HfP9kTGm/lq+C+WQeteGR69uLvkfodjo8JTo/TB4QpNpo1WnXjAQxll4dxL18WAg0Ac47STt9+vIPhC488L2AmWwqA8jE5T2DwXapPTu7GmIjqRtkvKg4BvBPQGvRfx7eQBxAqED6FPHS3UgVZ1Vo7FzcEhwaLBD4MKEHTss4O33lPD4wRzcbHVeR0UuDdpUS7bGp6V009b+01u7MdAWpX2XDf+64CvBNQHXCuYB4ad6PUGTyV8cpo73s9Qdy2Q8t+m40dE3R35b+h8cXtKG9SmXOr9uLLiLOKVJVurC5FVeJwVPolweHBlgqxITdZwqnyxPkAdN2CQZZod2k7XqzI8vXTvYZ34AfiKfHHuD6LKg+wVrBxJ2JkPaQXeFYMXJdGo6+Mg4xtQ4TWSijll1q1ybL47CdYFvVHLkxuA1gTTZuao/YVmDjyMMzqtx7+AlwcyAQXn9sbPuCm4OcPTHwW0BjkpMTDvsyBENjwCxMhE8vYZrj9/COoKHU8zJA/yp+ZFqb9NzSC4U+v8V2q+tW4lNKwAAAABJRU5ErkJggg==',
          width: 150,
          margin: [35, 15, 0, 0],
        },

        [
          {
            text: `ALBARAN #${data.invoiceData.id}`,
            style: 'invoiceTitle',
            width: '*',
            margin: [35, 15, 80, 0],
          },
          {
            stack: makeDates(data.invoiceData),
          },
        ],
      ],
    },
    content: [
      // Header

      // Billing Headers
      {
        columns: [
          {
            text: 'Factura de',
            style: 'invoiceBillingTitle',
          },
          {
            text: 'Factura para',
            style: 'invoiceBillingTitle',
          },
        ],
      },
      // Billing Details
      {
        columns: [
          {
            text: [
              { text: `${data.businessInfo.name}`, bold: true },
              `\n \n CIF: ${
                data.businessInfo.cif
              }  \n \n DATOS BANCARIOS:\n \n (ES49) (2100) 3000 1622 0171 1857`,
            ],
            style: 'invoiceBillingDetails',
          },
          {
            text: `${data.client.name} \n ${data.client.shopName}`,
            style: 'invoiceBillingDetails',
          },
        ],
      },
      // Billing Address Title
      {
        columns: [
          {
            text: 'Dirección',
            style: 'invoiceBillingAddressTitle',
          },
          {
            text: 'Dirección',
            style: 'invoiceBillingAddressTitle',
          },
        ],
      },
      // Billing Address
      {
        columns: [
          {
            text: `${data.businessInfo.address} \n ${data.businessInfo.city} ${
              data.businessInfo.postcode
            } \n ${data.businessInfo.country} \n ${
              data.businessInfo.telephone
            } \n ${data.businessInfo.email}`,
            style: 'invoiceBillingAddress',
          },
          {
            text: `${data.client.address} \n ${data.client.city} ${
              data.client.postcode
            } \n   ${data.client.province}`,
            style: 'invoiceBillingAddress',
          },
        ],
      },
      // Line breaks
      '\n\n',
      // Items
      {
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: ['auto', 'auto', 60, 'auto', 'auto', 80],

          body: makeProductsBody(data.products),
        }, // table
        //  layout: 'lightHorizontalLines'
      },
      {
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: [80, 80, 50, 50, 50, 65, 70],

          body: [
            // Table Header
            [
              {
                text: 'FORMA DE PAGO',
                style: 'itemsHeader',
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
              {
                text: 'BASE IMPONIBLE',
                style: 'itemsHeader',
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
              {
                text: 'IVA 21%',
                style: ['itemsHeader', 'center'],
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
              {
                text: 'RE 5.2%',
                style: ['itemsHeader', 'center'],
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
              {
                text: 'SUBTOTAL',
                style: ['itemsHeader', 'center'],
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
              {
                text: 'TRANSPORTE',
                style: ['itemsHeader', 'center'],
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
              {
                text: 'TOTAL',
                style: ['itemsHeader', 'center'],
                fontSize: 10,
                margin: [0, 20, 0, 0],
              },
            ],
            // Items
            // Item 1
            [
              {
                text: 'Efectivo',
                style: 'itemNumber',
                fontSize: 10,
              },
              {
                text: currencyFormatEs(data.totals.productsTotal),
                style: 'itemNumber',
                fontSize: 10,
              },
              {
                text: currencyFormatEs(data.totals.tax),
                style: 'itemNumber',
                fontSize: 10,
              },
              {
                text: currencyFormatEs(data.totals.re),
                style: 'itemNumber',
                fontSize: 10,
              },
              {
                text: currencyFormatEs(data.totals.subTotal),
                style: 'itemNumber',
                fontSize: 10,
              },
              {
                text: currencyFormatEs(data.totals.transport),
                style: 'itemNumber',
                fontSize: 10,
              },
              {
                text: currencyFormatEs(data.totals.invoiceTotal),
                style: 'itemTotal',
                fontSize: 10,
              },
            ],
            // END Items
          ],
        }, // table
        layout: 'lightHorizontalLines',
      },
    ],
    styles: {
      // Document Header
      documentHeaderLeft: {
        fontSize: 10,
        margin: [0, 0, 0, 0],
        alignment: 'left',
      },
      documentHeaderCenter: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: 'center',
      },
      documentHeaderRight: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: 'right',
      },
      // Document Footer
      documentFooterLeft: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: 'left',
      },
      documentFooterCenter: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: 'center',
      },
      documentFooterRight: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
        alignment: 'right',
      },
      // Invoice Title
      invoiceTitle: {
        fontSize: 20,
        bold: true,
        alignment: 'right',
        margin: [0, 0, 0, 15],
      },
      // Invoice Details
      invoiceSubTitle: {
        fontSize: 12,
        alignment: 'right',
      },
      invoiceSubValue: {
        fontSize: 12,
        alignment: 'right',
      },
      // Billing Headers
      invoiceBillingTitle: {
        fontSize: 14,
        bold: true,
        alignment: 'left',
        margin: [0, 20, 0, 5],
      },
      // Billing Details
      invoiceBillingDetails: {
        alignment: 'left',
      },
      invoiceBillingAddressTitle: {
        margin: [0, 7, 0, 3],
        bold: true,
      },
      invoiceBillingAddress: {},
      // Items Header
      itemsHeader: {
        margin: [0, 5, 0, 5],
        bold: true,
      },
      // Item Title
      itemTitle: {
        bold: true,
      },
      itemSubTitle: {
        italics: true,
        fontSize: 11,
      },
      itemNumber: {
        margin: [0, 5, 0, 5],
        alignment: 'center',
      },
      itemTotal: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: 'center',
      },

      // Items Footer (Subtotal, Total, Tax, etc)
      itemsFooterSubTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: 'right',
      },
      itemsFooterSubValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: 'center',
      },
      itemsFooterTotalTitle: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: 'right',
      },
      itemsFooterTotalValue: {
        margin: [0, 5, 0, 5],
        bold: true,
        alignment: 'center',
      },
      signaturePlaceholder: {
        margin: [0, 70, 0, 0],
      },
      signatureName: {
        bold: true,
        alignment: 'center',
      },
      signatureJobTitle: {
        italics: true,
        fontSize: 10,
        alignment: 'center',
      },
      notesTitle: {
        fontSize: 10,
        bold: true,
        margin: [0, 50, 0, 3],
      },
      notesText: {
        fontSize: 10,
      },
      center: {
        alignment: 'center',
      },
    },
    defaultStyle: {
      columnGap: 20,
    },
  };
};
